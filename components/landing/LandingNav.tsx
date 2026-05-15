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
      {/* ══════════════════════════════════════════════════════
          DESKTOP — Wide floating pill navbar
          ══════════════════════════════════════════════════════ */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 z-[100] justify-center px-6 pt-3">
        <nav
          className={`flex items-center justify-between w-full max-w-[900px] h-[54px] px-2.5 rounded-full border transition-all duration-500 ${
            scrolled
              ? "bg-[rgba(8,8,16,0.94)] border-white/[0.12] shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
              : "bg-[rgba(15,15,26,0.75)] border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
          }`}
          style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 pl-2 shrink-0">
            <Image src="/logo.png" alt="ESUTSphere" width={28} height={28} className="rounded-lg" />
            <span className="text-text-primary font-semibold text-[15px] tracking-[-0.3px]">
              ESUT<span className="text-brand-light">Sphere</span>
            </span>
          </Link>

          {/* Nav Links — centered */}
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = activeLink === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setActiveLink(link.href)}
                  className={`relative flex items-center gap-1.5 text-[13px] font-medium px-4 py-[7px] rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-brand text-white shadow-[0_2px_12px_rgba(124,58,237,0.45)]"
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
          <div className="flex items-center gap-2 pr-1">
            <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.07] transition-all">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand border-[1.5px] border-[#0F0F1A]" />
            </button>
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-brand hover:bg-brand-light text-white text-[13px] font-semibold pl-4 pr-4 py-[7px] rounded-full border border-brand-light/40 transition-all duration-200 hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:-translate-y-px"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </Link>
          </div>
        </nav>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE — Full-width sticky bar
          ══════════════════════════════════════════════════════ */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 z-[100] h-14 flex items-center justify-between px-4 border-b transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(8,8,16,0.95)] border-white/[0.10]"
            : "bg-brand/90 border-brand-light/20"
        }`}
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.png" alt="ESUTSphere" width={26} height={26} className="rounded-md" />
          <span className="text-white font-semibold text-[15px] tracking-[-0.3px]">
            ESUT<span className="text-white/80">Sphere</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan border-[1.5px] border-brand" />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE — Full-screen menu overlay
          ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99] md:hidden"
          >
            {/* Dark backdrop */}
            <div
              className="absolute inset-0 bg-[rgba(8,8,16,0.85)]"
              onClick={() => setMenuOpen(false)}
              style={{ backdropFilter: "blur(8px)" }}
            />

            {/* Full-width menu panel */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="relative bg-[rgba(15,15,26,0.97)] border-b border-white/[0.08] pt-16 pb-6 px-5"
              style={{ backdropFilter: "blur(24px)" }}
            >
              {/* Close + logo header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <Image src="/logo.png" alt="ESUTSphere" width={32} height={32} className="rounded-lg" />
                  <span className="text-text-primary font-semibold text-[17px]">
                    ESUT<span className="text-brand-light">Sphere</span>
                  </span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06] text-text-muted hover:text-text-primary transition-all border border-white/[0.08]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav links — large, full width */}
              <div className="space-y-1 mb-6">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeLink === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => { setActiveLink(link.href); setMenuOpen(false); }}
                      className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-200 ${
                        isActive
                          ? "bg-brand/15 text-brand-light border border-brand/20"
                          : "text-text-secondary hover:bg-white/[0.05] hover:text-text-primary border border-transparent"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? "bg-brand/20" : "bg-white/[0.06]"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[17px] font-medium">{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Sign In button */}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2.5 w-full bg-brand hover:bg-brand-light text-white text-[16px] font-semibold py-4 rounded-2xl transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.4)]"
              >
                <ArrowRight className="w-5 h-5" />
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
