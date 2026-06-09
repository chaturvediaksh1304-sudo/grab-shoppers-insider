"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, ArrowRight } from "lucide-react";
import { MacroBrowser } from "./MacroBrowser";
import { Reveal } from "@/components/ui/Reveal";

/** Landing-page preview of the macro browser — a compact "Hot right now" row. */
export function HotRightNow() {
  const router = useRouter();
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <Reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-down">
              <Flame className="h-4 w-4" /> Hot right now
            </div>
            <h2 className="font-display text-4xl italic">Trending resale</h2>
            <p className="mt-2 max-w-xl text-lg text-muted">
              Live prices and forecasts on the pieces moving fastest this week.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:border-cobalt"
          >
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <MacroBrowser
          preview
          onSelect={(q) => router.push(`/dashboard?q=${encodeURIComponent(q)}`)}
        />
      </Reveal>
    </section>
  );
}
