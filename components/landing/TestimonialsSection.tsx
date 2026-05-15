"use client";

import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    text: "I found 5 years of CSC past questions in one afternoon. ESUTSphere changed how I prepare for exams completely.",
    name: "Chika Nwankwo",
    handle: "@chika_cs",
    dept: "CSC 300L",
    initials: "CN",
  },
  {
    text: "The profile system is fire. I got recognized for uploading notes and my followers grew from 0 to 200 in 2 weeks.",
    name: "Temi Adewale",
    handle: "@temi_400",
    dept: "CSC 400L",
    initials: "TA",
  },
  {
    text: "As a lecturer, sharing notes with my class is now so much easier. Students actually engage with the material and ask better questions.",
    name: "Dr. A. Nwachukwu",
    handle: "Dept. of Computer Science",
    dept: "Lecturer",
    initials: "AN",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 px-5 md:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[13px] font-bold text-brand tracking-[1.5px] uppercase mb-4">TESTIMONIALS</p>
          <h2 className="font-display text-[clamp(32px,4vw,52px)] text-text-primary leading-[1.15] mb-4">
            What students are <span className="text-gold">saying</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 snap-x snap-mandatory overflow-x-auto md:overflow-visible scrollbar-hide">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.handle}
              className="relative bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-[20px] p-7 overflow-hidden transition-all duration-300 hover:border-brand/25 hover:-translate-y-1 snap-start min-w-[300px] md:min-w-0"
            >
              {/* Quote mark */}
              <span className="absolute -top-2.5 left-5 font-display text-[120px] leading-none text-brand/[0.12] pointer-events-none select-none">&ldquo;</span>

              {/* Stars */}
              <div className="flex gap-1 mb-4 relative z-[1]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-gold fill-gold" />
                ))}
              </div>

              <p className="text-[15px] text-text-secondary leading-[26px] mb-6 relative z-[1]">{t.text}</p>

              <div className="flex items-center gap-3 relative z-[1]">
                <div className="w-10 h-10 rounded-full bg-bg-surface-3 border border-white/10 flex items-center justify-center text-sm font-bold text-brand-light">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-disabled">{t.handle} · {t.dept}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
