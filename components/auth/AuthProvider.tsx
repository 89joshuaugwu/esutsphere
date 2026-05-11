"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const PUBLIC_ROUTES = ["/login", "/"];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!PUBLIC_ROUTES.includes(pathname) && !pathname.startsWith("/onboarding")) {
          router.push("/login");
        } else {
          setLoading(false);
        }
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          if (!pathname.startsWith("/onboarding")) {
            router.push("/onboarding/step-1");
          }
        } else {
          const userData = userDoc.data();
          if (userData.approvalStatus === "pending" && !pathname.startsWith("/onboarding/pending")) {
            router.push("/onboarding/pending");
          } else if (userData.approvalStatus === "rejected" && pathname !== "/login") {
            router.push("/login");
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
