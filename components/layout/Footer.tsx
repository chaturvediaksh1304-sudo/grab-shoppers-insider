import Link from "next/link";

// Social + external links. GitHub is known; replace the LinkedIn / Instagram / X
// placeholders with your real profile URLs.
const SOCIALS = {
  github: "https://github.com/chaturvediaksh1304-sudo",
  linkedin: "https://www.linkedin.com/in/aksh-chaturvedi", // TODO: confirm your LinkedIn URL
  instagram: "https://www.instagram.com/", // TODO: your Instagram URL
  x: "https://x.com/", // TODO: your X (Twitter) URL
};

const PHIA_URL = "https://www.phia.com";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9z" />
    </svg>
  );
}
function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M12 .5a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.2c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.1-.75.08-.74.08-.74 1.21.09 1.85 1.25 1.85 1.25 1.08 1.85 2.82 1.31 3.51 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0012 .5z" />
    </svg>
  );
}

const SOCIAL_BUTTONS = [
  { label: "X", href: SOCIALS.x, Icon: XIcon },
  { label: "Instagram", href: SOCIALS.instagram, Icon: InstagramIcon },
  { label: "LinkedIn", href: SOCIALS.linkedin, Icon: LinkedinIcon },
  { label: "GitHub", href: SOCIALS.github, Icon: GithubIcon },
];

const COLUMNS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Trending resale", href: "/#how-it-works" },
    ],
  },
  {
    title: "Data & ML",
    links: [
      { label: "eBay Browse API", href: "https://developer.ebay.com/", external: true },
      { label: "Google Trends", href: "https://trends.google.com/", external: true },
      { label: "Prophet", href: "https://facebook.github.io/prophet/", external: true },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "GitHub", href: SOCIALS.github, external: true },
      { label: "LinkedIn", href: SOCIALS.linkedin, external: true },
      { label: "Instagram", href: SOCIALS.instagram, external: true },
      { label: "X", href: SOCIALS.x, external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-surface-muted">
      {/* Giant "grab" watermark behind the content */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-8 left-0 select-none font-display text-[30vw] italic leading-[0.7] tracking-tight text-foreground/[0.045]"
      >
        grab
      </span>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-10 pt-24 md:grid-cols-2">
        {/* Brand + socials */}
        <div className="flex flex-col gap-6">
          <span className="font-display text-4xl italic text-foreground">grab</span>
          <p className="max-w-xs text-sm text-muted">
            Know what to buy before everyone else does — resale price trends &amp; ML
            forecasts for fashion.
          </p>

          <div className="flex items-center gap-2.5">
            {SOCIAL_BUTTONS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-all hover:-translate-y-0.5 hover:border-cobalt hover:text-cobalt"
              >
                <Icon />
              </a>
            ))}
          </div>

          <div className="mt-2 text-sm text-muted">
            <p>© 2026 · Built by Aksh Chaturvedi</p>
            <p className="mt-1">
              Inspired by{" "}
              <a
                href={PHIA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-2 hover:text-cobalt hover:underline"
              >
                Phia ↗
              </a>
            </p>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted transition-colors hover:text-cobalt"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-sm text-muted transition-colors hover:text-cobalt"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
