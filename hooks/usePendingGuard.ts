'use client';

import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

/**
 * Hook to guard actions for pending (unverified) users.
 * Instead of a separate pending page, pending users can browse all pages
 * but cannot perform write actions (upload, write, like, comment, download, follow).
 * Returns: { isPending, guardAction }
 *   - isPending: true if user is not approved
 *   - guardAction: wraps a callback — if pending, shows toast + returns false; if approved, calls callback + returns true
 */
export function usePendingGuard() {
  const { user } = useAuth();

  const isPending = user?.approvalStatus !== 'approved';

  const guardAction = useCallback(
    (action?: () => void, customMessage?: string): boolean => {
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
    [isPending]
  );

  return { isPending, guardAction };
}
