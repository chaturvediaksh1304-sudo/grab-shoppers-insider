"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Brand mark — the white "grab" wordmark sits on a cobalt→navy gradient chip
 * (the logo art is white-only, per the design system).
 */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-brand-gradient px-3 py-1.5 shadow-glow ${className}`}
    >
      <Image
        src="/assets/grab-logo.png"
        alt="Grab"
        width={58}
        height={32}
        priority
        className="h-5 w-auto"
      />
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent over the landing hero image; solid frosted bar otherwise.
  const transparent = pathname === "/" && !scrolled;

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        transparent
          ? "border-transparent bg-transparent"
          : "border-border bg-cream/80 backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Grab home">
          <BrandMark />
          <span
            className={`hidden text-sm font-medium sm:inline ${
              transparent ? "text-white/80" : "text-muted"
            }`}
          >
            Shoppers Insider
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/#how-it-works"
            className={`hidden text-sm font-medium transition-colors sm:inline ${
              transparent ? "text-white/85 hover:text-white" : "text-foreground/70 hover:text-cobalt"
            }`}
          >
            How it works
          </Link>
          <Link
            href="/dashboard"
            className={`rounded-pill px-4 py-2 text-sm font-semibold shadow-card transition-transform hover:-translate-y-0.5 ${
              transparent ? "bg-white text-navy" : "bg-brand-gradient text-white"
            }`}
          >
            Open dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}
