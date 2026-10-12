import { Coffee, Sprout } from "lucide-react";

const COFFEE_URL = "https://buymeacoffee.com/celticpermaculture";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <span className="flex items-center gap-2 font-display text-lg">
          <Sprout className="h-5 w-5 text-primary" />
          Seed to Table
        </span>
        <a
          href={COFFEE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:opacity-95"
        >
          <Coffee className="h-4 w-4" />
          Buy me a coffee
        </a>
      </div>
    </header>
  );
}
