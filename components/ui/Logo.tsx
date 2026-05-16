"use client";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "hero";
  variant?: "full" | "stacked" | "icon-only" | "text-only" | "compact";
  href?: string;
  className?: string;
}

const sizes = {
  sm:   { icon: 24, text: 14, gap: 8  },
  md:   { icon: 30, text: 17, gap: 10 },
  lg:   { icon: 48, text: 22, gap: 14 },
  hero: { icon: 64, text: 28, gap: 18 },
};

export default function Logo({
  size = "md",
  variant = "full",
  href,
  className = "",
}: LogoProps) {
  const { icon, text, gap } = sizes[size];

  const Wordmark = ({ compact }: { compact?: boolean }) => (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 0, lineHeight: 1 }}>
      <span
        style={{
          fontWeight: compact ? 700 : 800,
          fontSize: compact ? 13 : text,
          color: "var(--color-text-primary, #F8FAFC)",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        ESUT
      </span>
      <span
        style={{
          fontWeight: 400,
          fontSize: compact ? 13 : text,
          letterSpacing: "-0.01em",
          lineHeight: 1,
          ...(compact
            ? { color: "var(--color-text-muted, #94A3B8)" }
            : {
                background: "linear-gradient(135deg, #A855F7 0%, #7C3AED 45%, #06B6D4 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 0 12px rgba(124, 58, 237, 0.35))",
              }),
        }}
      >
        Sphere
      </span>
    </span>
  );

  const LogoIcon = () => (
    <Image
      src="/logo.png"
      alt="ESUTSphere Logo"
      width={icon}
      height={icon}
      priority
      className="shrink-0 rounded-full"
    />
  );

  const content = () => {
    switch (variant) {
      case "icon-only":
        return <LogoIcon />;
      case "text-only":
        return <Wordmark />;
      case "stacked":
        return (
          <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <LogoIcon />
            <Wordmark />
          </span>
        );
      case "compact":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <LogoIcon />
            <Wordmark compact />
          </span>
        );
      default: // "full"
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap }}>
            <LogoIcon />
            <Wordmark />
          </span>
        );
    }
  };

  if (!href) return <span className={className}>{content()}</span>;

  return (
    <Link href={href} className={`${className}`} style={{ textDecoration: "none", display: "inline-flex" }}>
      {content()}
    </Link>
  );
}
