import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function BlogListingPage() {
  const blogs = [
    {
      slug: "tech-fest-2024",
      title: "Everything you missed at the ESUT Tech Fest 2024",
      excerpt: "From robotics displays to coding hackathons, this year's Tech Fest was nothing short of spectacular.",
      author: "Jane Smith",
      date: "Oct 12, 2024",
      category: "Campus Events",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60"
    },
    {
      slug: "exam-prep-guide",
      title: "The Ultimate Guide to Surviving First Semester Exams",
      excerpt: "Late night studying? Here are proven techniques to retain information faster and ace your exams.",
      author: "John Doe",
      date: "Oct 10, 2024",
      category: "Academics",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
      <div className="text-center space-y-4 pt-6">
        <h1 className="font-display text-5xl text-text-primary">Campus Blog</h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">Stay updated with the latest news, student stories, and academic guides across ESUT.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.map(blog => (
          <Link key={blog.slug} href={`/blog/${blog.slug}`} className="group bg-[#16162A] border border-white/10 rounded-[20px] overflow-hidden hover:border-brand/40 transition-all duration-300 shadow-lg hover:shadow-[0_10px_40px_rgba(124,58,237,0.15)] flex flex-col">
            <div className="h-48 overflow-hidden relative">
              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-semibold text-white border border-white/10">
                {blog.category}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="font-display text-2xl text-text-primary mb-3 group-hover:text-brand-light transition-colors">{blog.title}</h2>
              <p className="text-text-secondary mb-6 line-clamp-3">{blog.excerpt}</p>
              
              <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-sm text-text-muted">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {blog.author}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {blog.date}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-brand group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
