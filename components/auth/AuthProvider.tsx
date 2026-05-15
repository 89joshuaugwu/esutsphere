"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

/**
 * Public routes that do NOT require authentication.
 * Per ESUT_SPHERE_AUTH.md §10: /, /login, /signup, /blog, /library, /profile are public.
 */
const PUBLIC_ROUTES = ["/", "/login", "/signup"];
const PUBLIC_PREFIXES = ["/blog", "/library", "/profile"];

/**
 * Auth pages that logged-in users should be redirected away from.
 */
const AUTH_PAGES = ["/login", "/signup"];

/**
 * Onboarding routes — require Firebase auth but NOT approval.
 */
const ONBOARDING_PREFIXES = ["/onboarding"];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

function isOnboardingRoute(pathname: string): boolean {
  return ONBOARDING_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // ── No user ──────────────────────────────────────────
      if (!user) {
        // Public routes are accessible without auth
        if (isPublicRoute(pathname)) {
          setLoading(false);
          return;
        }
        // Onboarding routes without auth → back to login
        if (isOnboardingRoute(pathname)) {
          router.push("/login");
          setLoading(false);
          return;
        }
        // All other routes require auth → redirect to login
        router.push("/login");
        setLoading(false);
        return;
      }

      // ── User exists ──────────────────────────────────────
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // New user — no Firestore doc yet → onboarding
          if (!isOnboardingRoute(pathname) && !isPublicRoute(pathname)) {
            router.push("/onboarding/step-1");
          }
        } else {
          const userData = userDoc.data();
          const status = userData.approvalStatus;

          // Rejected → show rejection on login page
          if (status === "rejected" && pathname !== "/login") {
            router.push("/login");
          }
          // Pending → allow access to ALL pages (actions blocked by usePendingGuard)
          // Just redirect away from auth pages and onboarding
          else if (status === "pending") {
            if (AUTH_PAGES.includes(pathname) || isOnboardingRoute(pathname)) {
              router.push("/feed");
            }
          }
          // Approved → redirect away from auth pages and onboarding
          else if (status === "approved") {
            if (AUTH_PAGES.includes(pathname) || isOnboardingRoute(pathname)) {
              router.push("/feed");
            }
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <span className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
