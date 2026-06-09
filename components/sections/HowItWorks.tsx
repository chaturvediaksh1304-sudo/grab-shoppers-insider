import { Search, LineChart, Sparkles } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    icon: Search,
    title: "Search any item",
    body: "Type a brand or product. Grab pulls live eBay listings to read the current resale market — average price, range, and depth.",
  },
  {
    icon: LineChart,
    title: "See price + demand",
    body: "Resale price is charted against Google Trends search interest, so you can see momentum building before it shows up in price.",
  },
  {
    icon: Sparkles,
    title: "Get an ML forecast",
    body: "A Prophet time-series model projects the next 30 days and calls it UP, DOWN, or STABLE with a confidence score.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface-muted">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="mb-12 max-w-2xl">
            <h2 className="font-display text-4xl italic">How it works</h2>
            <p className="mt-3 text-lg text-muted">
              Three real signals — resale price, search demand, and a forecast —
              in one view.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="flex h-full flex-col gap-4 rounded-card border border-border bg-surface p-6 shadow-card">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="text-muted">{s.body}</p>
                <span className="mt-auto font-mono-data text-sm text-cobalt">
                  0{i + 1}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
