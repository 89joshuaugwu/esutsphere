'use client';

import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

/**
 * Hook to guard actions for pending/suspended users.
 * Pending users can browse but cannot perform write actions.
 * Suspended users see a specific suspension message.
 * Returns: { isPending, isSuspended, guardAction }
 */
export function usePendingGuard() {
  const { user } = useAuth();

  const isPending = user?.approvalStatus !== 'approved';
  const isSuspended = user?.approvalStatus === 'rejected' && !!(user as any)?.suspendedBy;
  const isRejected = user?.approvalStatus === 'rejected' && !(user as any)?.suspendedBy;

  const guardAction = useCallback(
    (action?: () => void, customMessage?: string): boolean => {
      if (isSuspended) {
        toast.error(
          customMessage || '🚫 Your account has been suspended. Contact an admin to resolve this.',
          {
            duration: 5000,
            style: {
              background: '#1E1E35',
              color: '#F8FAFC',
              border: '1px solid rgba(239,68,68,0.3)',
              fontSize: '13px',
              fontWeight: 500,
            },
            icon: '🚫',
          }
        );
        return false;
      }
      if (isPending) {
        toast.error(
          customMessage || '🔒 Your account is not verified yet. You\'ll get full access once approved!',
          {
            duration: 4000,
            style: {
              background: '#1E1E35',
              color: '#F8FAFC',
              border: '1px solid rgba(245,158,11,0.3)',
              fontSize: '13px',
              fontWeight: 500,
            },
            icon: '🔒',
          }
        );
        return false;
      }
      if (action) action();
      return true;
    },
    [isPending, isSuspended]
  );

  return { isPending, isSuspended, isRejected, guardAction };
}
