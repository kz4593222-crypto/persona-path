-- Public member card (name + photo) shown in the community
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Member',
  avatar_url text,
  avatar_path text,
  name_changed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can see member cards" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members update their own card" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.guard_profile_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.id := OLD.id;
  NEW.created_at := OLD.created_at;
  NEW.avatar_url := OLD.avatar_url;
  NEW.updated_at := now();
  IF NEW.avatar_path IS NOT NULL AND NEW.avatar_path !~ ('^' || OLD.id::text || '/[A-Za-z0-9._-]+$') THEN
    RAISE EXCEPTION 'INVALID_AVATAR';
  END IF;
  IF NEW.display_name IS DISTINCT FROM OLD.display_name THEN
    IF OLD.name_changed_at IS NOT NULL AND OLD.name_changed_at > now() - interval '30 days' THEN
      RAISE EXCEPTION 'NAME_LOCKED';
    END IF;
    NEW.display_name := btrim(NEW.display_name);
    IF char_length(NEW.display_name) < 2 OR char_length(NEW.display_name) > 40 THEN
      RAISE EXCEPTION 'INVALID_NAME';
    END IF;
    NEW.name_changed_at := now();
  ELSE
    NEW.name_changed_at := OLD.name_changed_at;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_profile_update BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_update();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    left(coalesce(nullif(btrim(NEW.raw_user_meta_data->>'full_name'), ''), nullif(btrim(NEW.raw_user_meta_data->>'name'), ''), nullif(split_part(coalesce(NEW.email, ''), '@', 1), ''), 'Member'), 40),
    coalesce(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, display_name)
SELECT id, left(coalesce(nullif(split_part(coalesce(email, ''), '@', 1), ''), 'Member'), 40) FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Private fitness details, owner only
CREATE TABLE public.fitness_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  goal text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  plan_started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.fitness_profiles TO authenticated;
GRANT ALL ON public.fitness_profiles TO service_role;
ALTER TABLE public.fitness_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read fitness profile" ON public.fitness_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners create fitness profile" ON public.fitness_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners update fitness profile" ON public.fitness_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Community group chat
CREATE TABLE public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  reply_to_id uuid REFERENCES public.community_messages(id) ON DELETE SET NULL,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX community_messages_created_idx ON public.community_messages (created_at DESC);
CREATE INDEX community_messages_reply_idx ON public.community_messages (reply_to_id);
CREATE INDEX community_messages_user_idx ON public.community_messages (user_id);
GRANT SELECT, INSERT, DELETE ON public.community_messages TO authenticated;
GRANT ALL ON public.community_messages TO service_role;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read the group" ON public.community_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members post as themselves" ON public.community_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members delete own messages" ON public.community_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.message_likes (
  message_id uuid NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.message_likes TO authenticated;
GRANT ALL ON public.message_likes TO service_role;
ALTER TABLE public.message_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read likes" ON public.message_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members like as themselves" ON public.message_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members remove own likes" ON public.message_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Profile photos: public to view, members manage only their own folder
CREATE POLICY "Members upload own avatar" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Members read own avatar files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Members delete own avatar" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);