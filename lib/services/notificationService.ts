import { supabase } from '@/lib/supabase';

// =====================================================
// NOTIFICATION SERVICE
// =====================================================

/**
 * Fetch notifications for a profile.
 */
export async function fetchNotifications(profileId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false })
    .limit(50);

  return { data: data || [], error };
}

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  return { error };
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllNotificationsRead(profileId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', profileId)
    .eq('read', false);

  return { error };
}

/**
 * Create a notification.
 */
export async function createNotification(payload: {
  user_id: string;
  type: string;
  title: string;
  message: string;
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(payload)
    .select()
    .single();

  return { data, error };
}

/**
 * Subscribe to realtime notifications for a user.
 * Returns an unsubscribe function.
 */
export function subscribeToNotifications(
  profileId: string,
  onNewNotification: (notification: any) => void
) {
  const channel = supabase
    .channel(`notifications:${profileId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profileId}`,
      },
      (payload) => {
        onNewNotification(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
