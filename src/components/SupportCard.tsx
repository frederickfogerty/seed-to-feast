import { HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

const DONATE_URL = "https://donate.stripe.com/aFadR9eyjcYTfLZeru3gk00";
const SITE_URL = "https://celticpermaculture.ie/";

/**
 * The ask that sits at the end of a finished plan — the moment the app has
 * demonstrably helped, so it is the fairest place to mention donations.
 */
export function SupportCard({ className }: { className?: string }) {
  return (
    <section className={cn("rounded-xl border border-accent/35 bg-accent/[0.07] p-6 sm:p-8", className)}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
            <HeartHandshake className="h-3.5 w-3.5 text-accent" />
            Support Seed to Feast
          </p>
          <h2 className="mt-3 text-2xl">
            If this app helped you, how about helping us by donating?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Seed to Feast is made by{" "}
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Celtic Permaculture
            </a>
            , is free to use and has no adverts. Donations cover the hosting and the hours spent
            adding crops, protection advice and seasonal plans, so the tool can keep growing and
            stay free for everyone else who needs it.
          </p>
        </div>

        <div className="shrink-0 sm:text-right">
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-base font-semibold text-accent-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:opacity-95"
          >
            <HeartHandshake className="h-5 w-5" />
            Please donate using Stripe
          </a>
          <p className="mt-3 text-xs text-muted-foreground">
            Every donation, small or large, keeps the plan growing.
          </p>
        </div>
      </div>
    </section>
  );
}
