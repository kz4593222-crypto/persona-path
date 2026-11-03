DROP POLICY IF EXISTS "Members read own avatar files" ON storage.objects;
CREATE POLICY "Members view member photos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');