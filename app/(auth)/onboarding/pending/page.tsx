"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * This page is no longer used. Pending users are now redirected to /feed
 * where they can browse all content but actions are blocked by usePendingGuard.
 */
export default function PendingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/feed");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <span className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
