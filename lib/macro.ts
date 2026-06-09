import type { MacroItem } from "./types";

// Curated famous luxury items that seed the macro-browse grids. Images are
// hardcoded (real, verified Unsplash photography) so the grid looks complete
// even before eBay credentials are added. When keys are present, live eBay
// prices + Prophet forecasts layer on top — the image stays curated.
const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=800&q=80&auto=format&fit=crop`;

export const MACRO_ITEMS: MacroItem[] = [
  {
    query: "gucci gg marmont bag",
    label: "Gucci GG Marmont",
    category: "Gucci",
    image: img("photo-1548036328-c9fa89d128fa"),
    basePrice: 1500,
  },
  {
    query: "prada galleria bag",
    label: "Prada Galleria",
    category: "Prada",
    image: img("photo-1584917865442-de89df76afd3"),
    basePrice: 1200,
  },
  {
    query: "hermes birkin bag",
    label: "Hermès Birkin",
    category: "Hermès",
    image: img("photo-1591561954557-26941169b49e"),
    basePrice: 12000,
  },
  {
    query: "dior lady dior bag",
    label: "Dior Lady Dior",
    category: "Dior",
    image: img("photo-1594223274512-ad4803739b7c"),
    basePrice: 4500,
  },
  {
    query: "louis vuitton neverfull",
    label: "Louis Vuitton Neverfull",
    category: "Louis Vuitton",
    image: img("photo-1523779105320-d1cd346ff52b"),
    basePrice: 1800,
  },
  {
    query: "golden goose superstar sneakers",
    label: "Golden Goose Super-Star",
    category: "Golden Goose",
    image: img("photo-1560769629-975ec94e6a86"),
    basePrice: 450,
  },
  {
    query: "common projects achilles low",
    label: "Common Projects Achilles",
    category: "Common Projects",
    image: img("photo-1549298916-b41d501d3772"),
    basePrice: 320,
  },
  {
    query: "burberry trench coat",
    label: "Burberry Trench Coat",
    category: "Burberry",
    image: img("photo-1539533018447-63fcce2678e3"),
    basePrice: 1200,
  },
];

/** Fallback baseline (USD) for searches that aren't in the curated list. */
export const DEFAULT_BASE = 120;

/** Finds the curated item whose query/label best matches `q` (case-insensitive). */
export function matchMacroItem(q: string): MacroItem | undefined {
  const norm = q.trim().toLowerCase();
  return (
    MACRO_ITEMS.find((m) => m.query.toLowerCase() === norm) ??
    MACRO_ITEMS.find(
      (m) =>
        norm.includes(m.query.toLowerCase()) ||
        m.query.toLowerCase().includes(norm) ||
        m.label.toLowerCase().includes(norm),
    )
  );
}

/** Curated baseline price for a query, or the default when unknown. */
export function baseFor(q: string): number {
  return matchMacroItem(q)?.basePrice ?? DEFAULT_BASE;
}
