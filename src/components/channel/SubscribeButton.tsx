'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { toggleSubscribe } from '@/lib/api';

interface SubscribeButtonProps {
  channelId: string;
}

export default function SubscribeButton({ channelId }: SubscribeButtonProps) {
  const { currentUser } = useStore();
  const [subscribed, setSubscribed] = useState(
    currentUser?.subscriptions?.includes(channelId) || false
  );
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!currentUser) {
      alert('Please sign in to subscribe');
      return;
    }
    
    if (loading) return;
    setLoading(true);

    const willSubscribe = !subscribed;
    setSubscribed(willSubscribe);

    try {
      await toggleSubscribe(
        channelId,
        willSubscribe ? 'subscribe' : 'unsubscribe',
        currentUser.id
      );
    } catch (error) {
      // Revert optimistic update on failure
      setSubscribed(!willSubscribe);
      console.error('Failed to toggle subscribe:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`flex items-center gap-2 px-6 py-2 font-medium rounded-full transition-colors ${
        subscribed
          ? 'bg-surface-secondary text-text-primary hover:bg-surface-tertiary'
          : 'bg-text-primary text-surface-primary hover:bg-text-secondary'
      }`}
    >
      {subscribed ? (
        <>
          <Bell className="w-4 h-4" />
          Subscribed
        </>
      ) : (
        'Subscribe'
      )}
    </button>
  );
}
