import { Coffee, Heart, Sprout } from "lucide-react";
import { ShieldAlert } from "lucide-react";


const COFFEE_URL = "https://buymeacoffee.com/celticpermaculture";
const SITE_URL = "https://celticpermaculture.ie/";

export function MissionFooter() {
  return (
    <footer className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
      <div className="paper rounded-xl p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Sprout className="h-3.5 w-3.5 text-primary" />
              Why this exists
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Seed to Feast is brought to you by{" "}
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Celtic Permaculture
              </a>
              . It has one purpose: to help you grow food for yourself, your family and your
              friends.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              It runs on Lovable&apos;s free tier, so the credits can run out mid-day. If the app
              ever stops answering, just try again the next morning. If the coffee fund brings in
              enough, I&apos;ll buy a subscription so it can keep working for more people.
            </p>
          </div>

          <div className="shrink-0 sm:text-right">
            <a
              href={COFFEE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-base font-semibold text-accent-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:opacity-95"
            >
              <Coffee className="h-5 w-5" />
              Buy me a coffee
            </a>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground sm:justify-end">
              <Heart className="h-3 w-3 text-accent" />
              Every cup keeps the plan growing
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-border/70 pt-5">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>
              <span className="font-medium text-foreground">A note on accuracy.</span> Seed to
              Feast does its best to give you accurate, useful information, but growing depends on
              your soil, your weather and the seed you buy. Treat the plan as guidance rather than
              a guarantee: nothing here is professional advice, and no responsibility can be
              accepted for any inaccuracy or omission, or for any loss or damage arising from
              following it.
            </span>
          </p>
        </div>
      </div>
    </footer>

  );
}
