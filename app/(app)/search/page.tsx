"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, FileText, Users, PenLine } from "lucide-react";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  
  const [activeTab, setActiveTab] = useState<"all" | "posts" | "users" | "documents">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    users: any[];
    posts: any[];
    documents: any[];
  }>({ users: [], posts: [], documents: [] });

  useEffect(() => {
    if (!q) return;
    
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const queryText = q.toLowerCase();
        
        // Basic naive search using ">= query" and "<= query + '\uf8ff'" for string matching
        // In a real production app, you'd use Algolia or Typesense
        
        // 1. Fetch Users
        const usersRef = collection(db, "users");
        const qUsers = query(usersRef, where("username", ">=", queryText), where("username", "<=", queryText + "\uf8ff"), limit(10));
        const usersSnap = await getDocs(qUsers);
        const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. Fetch Posts
        const postsRef = collection(db, "posts");
        const qPosts = query(postsRef, orderBy("createdAt", "desc"), limit(20));
        const postsSnap = await getDocs(qPosts);
        // Client side filter since Firestore lacks full text search
        const postsData = postsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(p => p.title?.toLowerCase().includes(queryText) || p.content?.toLowerCase().includes(queryText));

        // 3. Fetch Documents
        const docsRef = collection(db, "documents");
        const qDocs = query(docsRef, orderBy("createdAt", "desc"), limit(20));
        const docsSnap = await getDocs(qDocs);
        const docsData = docsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(d => d.title?.toLowerCase().includes(queryText) || d.courseCode?.toLowerCase().includes(queryText));

        setResults({
          users: usersData,
          posts: postsData,
          documents: docsData
        });
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [q]);

  const tabs = [
    { id: "all", label: "All Results", icon: Search },
    { id: "documents", label: "Library", icon: FileText },
    { id: "posts", label: "Posts & Blogs", icon: PenLine },
    { id: "users", label: "Users", icon: Users },
  ] as const;

  return (
    <div className="max-w-[800px] mx-auto py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Search results for "{q}"
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.07] mb-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-all whitespace-nowrap ${
                isActive
                  ? "text-brand-light border-brand"
                  : "text-text-disabled border-transparent hover:text-text-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !q ? (
        <div className="text-center py-20 text-text-muted">
          Type something in the search bar to find results.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Users */}
          {(activeTab === "all" || activeTab === "users") && (
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand" /> Users
              </h2>
              {results.users.length === 0 ? (
                <p className="text-text-disabled text-sm">No users found.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {results.users.map((u) => (
                    <Link
                      key={u.id}
                      href={`/profile/${u.username}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-brand/30 transition-all"
                    >
                      <img src={u.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt={u.username} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="text-sm font-bold text-text-primary">{u.displayName}</p>
                        <p className="text-xs text-text-disabled">@{u.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Documents */}
          {(activeTab === "all" || activeTab === "documents") && (
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan" /> Library Documents
              </h2>
              {results.documents.length === 0 ? (
                <p className="text-text-disabled text-sm">No documents found.</p>
              ) : (
                <div className="grid gap-3">
                  {results.documents.map((d) => (
                    <Link
                      key={d.id}
                      href={`/library/${d.id}`}
                      className="block p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-cyan/30 transition-all"
                    >
                      <h3 className="text-sm font-bold text-text-primary mb-1">{d.title}</h3>
                      <p className="text-xs text-text-disabled line-clamp-2">{d.description}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Posts */}
          {(activeTab === "all" || activeTab === "posts") && (
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <PenLine className="w-5 h-5 text-pink-500" /> Posts & Blogs
              </h2>
              {results.posts.length === 0 ? (
                <p className="text-text-disabled text-sm">No posts found.</p>
              ) : (
                <div className="grid gap-3">
                  {results.posts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/blog/${p.id}`}
                      className="block p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-pink-500/30 transition-all"
                    >
                      <h3 className="text-sm font-bold text-text-primary mb-1">{p.title || "Untitled Post"}</h3>
                      <p className="text-xs text-text-disabled line-clamp-2">{p.excerpt || p.content}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
