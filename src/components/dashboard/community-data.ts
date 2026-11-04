import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MemberCard } from '@/lib/account';

export type CommunityMessage = {
  id: string;
  user_id: string;
  reply_to_id: string | null;
  body: string;
  created_at: string;
  author: MemberCard | null;
  likes: { user_id: string }[];
};
export type Thread = { message: CommunityMessage; original: CommunityMessage | undefined; responses: CommunityMessage[] };

const SELECT = 'id, user_id, reply_to_id, body, created_at, author:profiles(id, display_name, avatar_url, avatar_path), likes:message_likes(user_id)';
const FEED_SIZE = 150;

async function fetchByIds(ids: string[]) {
  if (!ids.length) return [];
  const { data, error } = await supabase.from('community_messages').select(SELECT).in('id', ids);
  if (error) throw error;
  return data as unknown as CommunityMessage[];
}

async function fetchResponses(ids: string[]) {
  if (!ids.length) return [];
  const { data, error } = await supabase.from('community_messages').select(SELECT).in('reply_to_id', ids).order('created_at');
  if (error) throw error;
  return data as unknown as CommunityMessage[];
}

export function useCommunityFeed() {
  return useQuery({
    queryKey: ['community', 'feed'],
    queryFn: async () => {
      const { data, error } = await supabase.from('community_messages').select(SELECT).order('created_at', { ascending: false }).limit(FEED_SIZE);
      if (error) throw error;
      const messages = (data as unknown as CommunityMessage[]).reverse();
      // Quoted messages older than the loaded window are fetched so every reply shows its context.
      const loaded = new Set(messages.map(message => message.id));
      const missing = [...new Set(messages.map(message => message.reply_to_id).filter((id): id is string => Boolean(id) && !loaded.has(id!)))];
      const quoted = await fetchByIds(missing);
      return { messages, quoted: Object.fromEntries([...messages, ...quoted].map(message => [message.id, message])) as Record<string, CommunityMessage> };
    },
  });
}

export function useMyThreads(userId: string, kind: 'questions' | 'replies') {
  return useQuery({
    queryKey: ['community', kind, userId],
    queryFn: async (): Promise<Thread[]> => {
      let query = supabase.from('community_messages').select(SELECT).eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
      query = kind === 'questions' ? query.is('reply_to_id', null) : query.not('reply_to_id', 'is', null);
      const { data, error } = await query;
      if (error) throw error;
      const mine = data as unknown as CommunityMessage[];
      const [responses, originals] = await Promise.all([
        fetchResponses(mine.map(message => message.id)),
        kind === 'replies' ? fetchByIds([...new Set(mine.map(message => message.reply_to_id!))]) : Promise.resolve([]),
      ]);
      return mine.map(message => ({
        message,
        original: originals.find(original => original.id === message.reply_to_id),
        responses: responses.filter(response => response.reply_to_id === message.id),
      }));
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, replyToId, userId }: { body: string; replyToId: string | null; userId: string }) => {
      const { error } = await supabase.from('community_messages').insert({ body: body.trim(), reply_to_id: replyToId, user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community'] }),
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, liked, userId }: { messageId: string; liked: boolean; userId: string }) => {
      const { error } = liked
        ? await supabase.from('message_likes').delete().eq('message_id', messageId).eq('user_id', userId)
        : await supabase.from('message_likes').insert({ message_id: messageId, user_id: userId });
      if (error && error.code !== '23505') throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community'] }),
  });
}

/** Live updates: new messages, likes and member name/photo changes refresh the community. */
export function useCommunityLive() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const refresh = () => void queryClient.invalidateQueries({ queryKey: ['community'] });
    const channel = supabase
      .channel(`community-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_messages' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_likes' }, refresh)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, refresh)
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [queryClient]);
}

export function formatMessageTime(iso: string, now = new Date()) {
  const date = new Date(iso);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (date.toDateString() === now.toDateString()) return time;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
}
