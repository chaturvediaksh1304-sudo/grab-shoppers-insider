"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const LINE_ONE = ["Know", "what", "to", "buy"];
const LINE_TWO = ["before", "everyone", "else", "does."];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const word: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/** Landing hero — full-bleed editorial background image with white text overlay. */
export function Hero() {
  return (
    <section className="relative isolate -mt-16 overflow-hidden">
      {/* Editorial background image (bleeds up behind the transparent navbar) */}
      <Image
        src="/assets/bg-image.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      {/* Navy overlay for legibility */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/80 via-navy/65 to-navy/90" />

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-7 px-5 pb-28 pt-40 text-center sm:pb-36 sm:pt-48">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 rounded-pill border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-white" />
          Resale intelligence for fashion
        </motion.span>

        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="font-display text-5xl italic leading-[1.05] text-white sm:text-7xl"
        >
          <span className="block">
            {LINE_ONE.map((w, i) => (
              <motion.span key={i} variants={word} className="mr-[0.25em] inline-block">
                {w}
              </motion.span>
            ))}
          </span>
          <span className="block bg-[linear-gradient(90deg,#ffffff,#aebfff)] bg-clip-text text-transparent">
            {LINE_TWO.map((w, i) => (
              <motion.span key={i} variants={word} className="mr-[0.25em] inline-block">
                {w}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="max-w-xl text-lg text-white/80"
        >
          Grab tracks real eBay resale prices, Google Trends demand, and ML price
          forecasts — so you buy before value spikes and know what holds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-pill bg-white px-6 py-3 font-semibold text-navy shadow-glow transition-transform hover:-translate-y-0.5"
          >
            Open the dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/#how-it-works"
            className="rounded-pill border border-white/30 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur transition-colors hover:bg-white/15"
          >
            How it works
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
