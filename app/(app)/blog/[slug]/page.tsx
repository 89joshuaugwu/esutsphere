"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-20">
      <Link href="/blog" className="inline-flex items-center gap-2 text-text-muted hover:text-brand-light transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      <div className="mb-10 space-y-6 text-center">
        <div className="inline-block px-3 py-1 bg-brand/10 text-brand-light rounded-full text-sm font-semibold border border-brand/20">
          Campus Events
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-text-primary leading-tight">
          Everything you missed at the ESUT Tech Fest 2024
        </h1>
        
        <div className="flex items-center justify-center gap-6 text-text-secondary text-sm pt-4">
          <span className="flex items-center gap-2"><User className="w-4 h-4" /> Jane Smith</span>
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Oct 12, 2024</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 5 min read</span>
        </div>
      </div>

      <img 
        src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80" 
        alt="Tech Fest"
        className="w-full h-[400px] object-cover rounded-[20px] shadow-2xl mb-12 border border-white/10"
      />

      <article className="prose prose-invert prose-brand max-w-none text-text-secondary text-lg leading-relaxed">
        <p>
          The atmosphere was electric as students from across various faculties gathered at the main auditorium. 
          This year's Tech Fest was not just about coding; it was a celebration of innovation and student-led solutions to real-world problems.
        </p>
        <h2>The Hackathon Highlights</h2>
        <p>
          Over 20 teams participated in the 24-hour hackathon. The winning project, an AI-driven agricultural mapping tool, 
          was developed by a group of 300L Computer Science students. It highlighted the sheer talent hidden within our campus.
        </p>
        <blockquote>
          "We wanted to build something that actually solves a local problem. Tech isn't just about flashy apps; it's about impact." 
          - Lead Developer, Winning Team
        </blockquote>
        <p>
          Beyond the hackathon, we had engaging panel sessions with industry leaders who shared insights on navigating the tech landscape post-graduation.
        </p>
      </article>
    </div>
  );
}
