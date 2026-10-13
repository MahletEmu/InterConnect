import { supabase } from '@/lib/supabase';

// =====================================================
// MESSAGE SERVICE
// =====================================================

/**
 * Fetch or create a conversation between two users.
 */
export async function getOrCreateConversation(profileIdA: string, profileIdB: string) {
  // Find existing conversation where both users are members
  const { data: existingMembers } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', profileIdA);

  if (existingMembers && existingMembers.length > 0) {
    const convIds = existingMembers.map((m) => m.conversation_id);
    const { data: matchingConv } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', profileIdB)
      .in('conversation_id', convIds)
      .single();

    if (matchingConv) {
      return { conversationId: matchingConv.conversation_id, error: null };
    }
  }

  // Create a new conversation
  const { data: newConv, error: convError } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single();

  if (convError || !newConv) {
    return { conversationId: null, error: convError };
  }

  // Add both users as members
  await supabase.from('conversation_members').insert([
    { conversation_id: newConv.id, user_id: profileIdA },
    { conversation_id: newConv.id, user_id: profileIdB },
  ]);

  return { conversationId: newConv.id, error: null };
}

/**
 * Fetch all conversations for a profile (with last message).
 */
export async function fetchConversations(profileId: string) {
  const { data, error } = await supabase
    .from('conversation_members')
    .select(`
      conversation_id,
      conversations (
        id,
        updated_at,
        conversation_members (
          user_id,
          profiles (id, full_name, avatar_url, role)
        ),
        messages (
          id,
          content,
          created_at,
          sender_id,
          read_at
        )
      )
    `)
    .eq('user_id', profileId);

  return { data: data || [], error };
}

/**
 * Fetch messages for a conversation.
 */
export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      read_at,
      sender_id,
      profiles:sender_id (id, full_name, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return { data: data || [], error };
}

/**
 * Send a message.
 */
export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single();

  if (!error) {
    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  }

  return { data, error };
}

/**
 * Mark messages as read.
 */
export async function markMessagesRead(conversationId: string, readerProfileId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', readerProfileId)
    .is('read_at', null);

  return { error };
}

/**
 * Subscribe to realtime messages in a conversation.
 * Returns an unsubscribe function.
 */
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: any) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
