import { HeartHandshake, Sprout } from "lucide-react";

const DONATE_URL = "https://donate.stripe.com/aFadR9eyjcYTfLZeru3gk00";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <span className="flex items-center gap-2 font-display text-lg">
          <Sprout className="h-5 w-5 text-primary" />
          Seed to Feast
        </span>
        <a
          href={DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:opacity-95"
        >
          <HeartHandshake className="h-4 w-4" />
          Please donate using Stripe
        </a>
      </div>
    </header>
  );
}
