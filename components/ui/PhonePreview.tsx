"use client";

import { motion } from "framer-motion";
import { TrendingUp, Search } from "lucide-react";
import { Reveal } from "./Reveal";

// A self-contained mini "app" rendered inside a floating CSS phone frame.
const SPARK = "M0 70 L20 64 L40 66 L60 52 L80 48 L100 40 L120 30 L140 34 L160 20 L180 10";

export function PhonePreview() {
  return (
    <section className="relative overflow-hidden bg-brand-gradient">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 lg:grid-cols-2">
        <Reveal>
          <div className="text-white">
            <h2 className="font-display text-4xl italic sm:text-5xl">
              Your resale edge, in your pocket
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/80">
              Every search returns the same trio: a live price chart, search-demand
              overlay, and a Prophet forecast badge. Clean enough to check before you
              buy, deep enough to trust.
            </p>
            <ul className="mt-6 space-y-2 text-white/90">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> Real eBay resale prices
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> Google Trends demand signal
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> 30-day ML price forecast
              </li>
            </ul>
          </div>
        </Reveal>

        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-[520px] w-[260px] rounded-[2.75rem] border-[10px] border-dark-ink bg-dark-ink shadow-2xl"
            >
              {/* Notch */}
              <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-dark-ink" />
              {/* Screen */}
              <div className="h-full w-full overflow-hidden rounded-[2rem] bg-cream">
                <div className="bg-brand-gradient px-4 pb-5 pt-8 text-white">
                  <div className="font-display text-xl italic">grab</div>
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm text-white/90 backdrop-blur">
                    <Search className="h-4 w-4" /> Salomon XT-6
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs text-muted">Avg resale</div>
                      <div className="font-mono-data text-2xl font-semibold">$168</div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-pill bg-up/15 px-2.5 py-1 text-xs font-semibold text-up">
                      <TrendingUp className="h-3.5 w-3.5" /> Rising 82%
                    </span>
                  </div>

                  <div className="rounded-xl border border-border bg-surface p-3">
                    <svg viewBox="0 0 180 80" className="h-24 w-full">
                      {/* CSS draw-in (globals: .draw-line) — always visible,
                          no scroll/IntersectionObserver dependency. */}
                      <path
                        d={SPARK}
                        fill="none"
                        stroke="#1A3FD4"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="draw-line"
                      />
                    </svg>
                    <div className="mt-1 flex justify-between font-mono-data text-[10px] text-muted">
                      <span>Jun</span>
                      <span>now</span>
                      <span>+30d</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["30d", "+9%"],
                      ["60d", "+14%"],
                      ["90d", "+22%"],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-lg bg-surface-muted p-2 text-center">
                        <div className="text-[10px] uppercase text-muted">{k}</div>
                        <div className="font-mono-data text-sm font-semibold text-up">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
