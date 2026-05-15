"use client";

import { useEffect, useRef, useState } from "react";
import { Users, FileText, BookOpen, Building2 } from "lucide-react";

const STATS = [
  { icon: Users, value: 5000, suffix: "+", label: "Active Students", emoji: "👥" },
  { icon: FileText, value: 2000, suffix: "+", label: "Documents", emoji: "📄" },
  { icon: BookOpen, value: 50, suffix: "+", label: "Course Codes", emoji: "📚" },
  { icon: Building2, value: 15, suffix: "+", label: "Departments", emoji: "🏛️" },
];

function useCountUp(target: number, inView: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.max(1, Math.floor(target / 60));
    const interval = duration / (target / step);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [target, inView]);
  return count;
}

function StatCard({ stat, inView }: { stat: (typeof STATS)[0]; inView: boolean }) {
  const count = useCountUp(stat.value, inView);
  const Icon = stat.icon;

  return (
    <div className="relative bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-[20px] p-8 text-center backdrop-blur-[8px] transition-all duration-300 hover:border-brand/30 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] group overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-[linear-gradient(to_right,transparent,rgba(124,58,237,0.6),transparent)]" />
      
      <div className="w-12 h-12 rounded-xl bg-brand/15 border border-brand/25 flex items-center justify-center mx-auto mb-4 text-xl group-hover:scale-110 transition-transform">
        {stat.emoji}
      </div>
      <span className="block text-5xl font-display bg-[linear-gradient(135deg,#A855F7,#06B6D4)] bg-clip-text text-transparent mb-2">
        {count.toLocaleString()}{stat.suffix}
      </span>
      <span className="text-[15px] font-medium text-text-muted">{stat.label}</span>
    </div>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 px-5 md:px-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-[1100px] mx-auto">
        {STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} inView={inView} />
        ))}
      </div>
    </section>
  );
}
