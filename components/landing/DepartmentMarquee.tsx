"use client";

import { DEPARTMENTS } from "@/constants/departments";

export default function DepartmentMarquee() {
  const depts = [...DEPARTMENTS, ...DEPARTMENTS];

  return (
    <section className="py-6 border-y border-white/[0.06] bg-[rgba(15,15,26,0.5)] overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-[120px] z-[2] pointer-events-none bg-[linear-gradient(to_right,#0F0F1A,transparent)]" />
      <div className="absolute top-0 bottom-0 right-0 w-[120px] z-[2] pointer-events-none bg-[linear-gradient(to_left,#0F0F1A,transparent)]" />

      <div className="flex gap-8 items-center animate-[marquee-scroll_80s_linear_infinite] w-max">
        {depts.map((d, i) => (
          <div
            key={`${d.name}-${i}`}
            className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-text-muted px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] shrink-0"
          >
            <span>{d.emoji}</span>
            <span>{d.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
