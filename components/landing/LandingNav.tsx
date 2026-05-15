"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Bell, Home, BookOpen, Users, PenLine, ArrowRight, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Library", href: "/library", icon: BookOpen },
  { label: "Community", href: "/feed", icon: Users },
  { label: "Blog", href: "/blog", icon: PenLine },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* ── Floating Pill Navbar ─────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pt-3 pointer-events-none">
        <nav
          className={`pointer-events-auto flex items-center gap-1 h-[52px] px-2.5 sm:px-2 rounded-full border transition-all duration-500 w-[calc(100%-2rem)] sm:w-auto ${
            scrolled
              ? "bg-[rgba(8,8,16,0.92)] border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              : "bg-[rgba(15,15,26,0.75)] border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
          }`}
          style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
        >
          {/* Logo + Gradient Wordmark */}
          <Link href="/" className="flex items-center gap-2 px-3 shrink-0">
            <Image src="/logo.png" alt="ESUTSphere" width={28} height={28} className="rounded-lg" />
            <span className="text-[15px] font-bold tracking-[-0.3px]">
              <span className="bg-[linear-gradient(135deg,#A855F7_0%,#7C3AED_45%,#06B6D4_100%)] bg-clip-text text-transparent">
                ESUTSphere
              </span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-0.5 mx-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = activeLink === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setActiveLink(link.href)}
                  className={`relative flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-[7px] rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-brand text-white shadow-[0_2px_12px_rgba(124,58,237,0.4)]"
                      : "text-text-muted hover:text-text-primary hover:bg-white/[0.07]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right — Bell + Sign In */}
          <div className="hidden md:flex items-center gap-1.5 ml-1">
            <button className="relative w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.07] transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand border border-bg-base" />
            </button>
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-brand hover:bg-brand-light text-white text-[13px] font-semibold ml-0.5 pl-3.5 pr-4 py-[7px] rounded-full border border-brand-light/40 transition-all duration-200 hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:-translate-y-px"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </Link>
          </div>

          {/* Mobile — Bell + Hamburger */}
          <div className="flex md:hidden items-center gap-1 ml-auto pr-1">
            <button className="relative w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand border border-bg-base" />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-white/[0.08] hover:text-text-primary transition-all"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile Menu Panel ────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99] md:hidden"
          >
            <div className="absolute inset-0 bg-[rgba(8,8,16,0.6)]" onClick={() => setMenuOpen(false)} style={{ backdropFilter: "blur(6px)" }} />

            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="relative mx-4 mt-[72px] bg-[rgba(22,22,42,0.95)] border border-white/[0.10] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
              style={{ backdropFilter: "blur(20px)" }}
            >
              {/* Links */}
              <div className="p-3 pt-4 space-y-1">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeLink === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => { setActiveLink(link.href); setMenuOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-brand/15 text-brand-light"
                          : "text-text-secondary hover:bg-white/[0.05] hover:text-text-primary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[15px] font-medium">{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Sign In */}
              <div className="p-3 pt-0">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-brand hover:bg-brand-light text-white text-[15px] font-semibold py-3 rounded-xl transition-all duration-200"
                >
                  <ArrowRight className="w-4 h-4" />
                  Sign In
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
