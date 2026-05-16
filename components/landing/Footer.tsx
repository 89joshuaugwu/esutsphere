"use client";

import Link from "next/link";
import Image from "next/image";
import { Globe, Hash, Link2, Mail } from "lucide-react";
import Logo from "@/components/ui/Logo";

const FOOTER_LINKS = {
  Platform: [
    { label: "Home", href: "/" },
    { label: "Library", href: "/library" },
    { label: "Community", href: "/feed" },
    { label: "Blog", href: "/blog" },
  ],
  Resources: [
    { label: "Study Materials", href: "/library" },
    { label: "Past Questions", href: "/library" },
    { label: "Help Center", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

const SOCIALS = [
  { icon: Globe, href: "#", label: "Website" },
  { icon: Hash, href: "#", label: "Twitter/X" },
  { icon: Link2, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="bg-bg-surface-1 border-t border-white/[0.06] pt-16 pb-8 px-5 md:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-[1.8fr_1fr_1fr_1fr] gap-10 md:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Logo variant="compact" size="sm" />
            </Link>
            <p className="text-sm text-text-disabled leading-relaxed max-w-[280px] mb-6">
              The premier academic social platform for Enugu State University of Science and Technology students.
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-text-muted hover:bg-brand/15 hover:text-brand-light hover:border-brand/30 transition-all"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[13px] font-bold text-text-primary tracking-[0.5px] uppercase mb-4">{title}</h4>
              <div className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-text-disabled hover:text-text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/[0.06] gap-4">
          <p className="text-[13px] text-text-disabled">© 2026 ESUTSphere. All rights reserved.</p>
          <p className="text-[13px] text-text-disabled">
            Made with <span className="text-brand">♥</span> for ESUT students
          </p>
        </div>
      </div>
    </footer>
  );
}
