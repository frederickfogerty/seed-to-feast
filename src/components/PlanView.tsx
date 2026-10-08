import { useMemo, useState } from "react";
import {
  Sprout,
  Hammer,
  CalendarDays,
  ShoppingBasket,
  Ruler,
  Clock,
  Leaf,
  Sun,
  Snowflake,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, tasksByWeek, type GardenPlan } from "@/lib/plan";

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="paper rounded-xl p-6 sm:p-8">
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 text-primary">{icon}</span>
        <div>
          <h2 className="text-2xl">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

const KIND_STYLE: Record<string, string> = {
  prep: "bg-earth/15 text-earth",
  sow: "bg-primary/12 text-primary",
  plant: "bg-sky/20 text-foreground",
  care: "bg-muted text-muted-foreground",
  harvest: "bg-accent/18 text-accent",
};

export function PlanView({ plan, onRestart }: { plan: GardenPlan; onRestart: () => void }) {
  const weeks = useMemo(() => tasksByWeek(plan.tasks), [plan]);
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const visibleWeeks = showAllWeeks ? weeks : weeks.slice(0, 12);

  const seedTotal = plan.crops.reduce((a, c) => a + c.seeds, 0);

  return (
    <div className="space-y-6">
      <header className="paper rounded-xl p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your growing plan</p>
        <h1 className="mt-2 text-4xl">
          {plan.input.locationName || "Your garden"}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {plan.crops.length} crops across {plan.beds.growingAreaM2} m² of beds
          {plan.input.greenhouse ? ` plus a ${plan.input.greenhouseM2} m² greenhouse` : ""} — roughly{" "}
          {plan.totalYieldKg} kg of food in a good year.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {[
            { label: "Crops", value: `${plan.crops.length}` },
            { label: "Seeds to buy", value: `${seedTotal}` },
            { label: "Beds", value: `${plan.beds.bedCount}` },
            { label: "Setup time", value: `${plan.beds.totalHours} h` },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-secondary/70 px-4 py-3">
              <div className="font-display text-2xl">{s.value}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-5" onClick={onRestart}>
          Start a new plan
        </Button>
      </header>

      <Section
        icon={<Sprout className="h-6 w-6" />}
        title="Crops and seeds to buy"
        subtitle="Quantities are sized to your space and household, with spare seed for thinning and losses."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Crop</th>
                <th className="py-2 pr-3">Where</th>
                <th className="py-2 pr-3">Area</th>
                <th className="py-2 pr-3">Plants</th>
                <th className="py-2 pr-3">Seeds</th>
                <th className="py-2 pr-3">Packets</th>
                <th className="py-2">Expected</th>
              </tr>
            </thead>
            <tbody>
              {plan.crops.map((c) => (
                <tr key={c.crop.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-3">
                    <div className="font-medium">{c.crop.name}</div>
                    <div className="text-xs text-muted-foreground">{c.crop.tip}</div>
                  </td>
                  <td className="py-3 pr-3">
                    <Badge variant="secondary">{c.underCover ? "Greenhouse" : "Outside"}</Badge>
                  </td>
                  <td className="py-3 pr-3">{c.areaM2} m²</td>
                  <td className="py-3 pr-3">{c.plants}</td>
                  <td className="py-3 pr-3">{c.seeds}</td>
                  <td className="py-3 pr-3">{c.packets}</td>
                  <td className="py-3">{c.crop.category === "flower" ? "flowering" : `${c.estimatedYieldKg} kg`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        icon={<Hammer className="h-6 w-6" />}
        title="Making the beds"
        subtitle={`${plan.beds.bedCount} bed${plan.beds.bedCount > 1 ? "s" : ""} of ${plan.beds.bedWidthM} m × ${plan.beds.bedLengthM} m with ${plan.beds.pathWidthCm} cm paths — about ${plan.beds.totalHours} hours of work in total.`}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-lg">
              <Ruler className="h-4 w-4 text-primary" /> Orientation
            </h3>
            <p className="text-sm text-muted-foreground">{plan.beds.orientation}</p>

            <h3 className="mt-6 mb-2 flex items-center gap-2 text-lg">
              <Leaf className="h-4 w-4 text-primary" /> Fertility
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {plan.beds.fertility.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {f}
                </li>
              ))}
            </ul>

            <h3 className="mt-6 mb-2 flex items-center gap-2 text-lg">
              <Hammer className="h-4 w-4 text-primary" /> Tools you'll need
            </h3>
            <ul className="grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
              {plan.beds.tools.map((t) => (
                <li key={t}>· {t}</li>
              ))}
            </ul>
          </div>

          <ol className="space-y-4">
            {plan.beds.steps.map((s, i) => (
              <li key={s.title} className="rounded-lg border border-border/70 bg-secondary/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-display text-lg">
                    {i + 1}. {s.title}
                  </h4>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {s.hours} h
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section
        icon={<Sun className="h-6 w-6" />}
        title="Season by season"
        subtitle="The shape of the year at a glance."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {plan.seasons.map((s) => (
            <div key={s.season} className="rounded-lg border border-border/70 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-lg">
                {s.season === "Winter" ? (
                  <Snowflake className="h-4 w-4 text-sky" />
                ) : (
                  <Leaf className="h-4 w-4 text-primary" />
                )}
                {s.season}
              </h3>
              {s.items.length ? (
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {s.items.map((i) => (
                    <li key={i}>· {i}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nothing to sow — tidy up, mulch the beds and plan next year.
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section
        icon={<CalendarDays className="h-6 w-6" />}
        title="Week by week"
        subtitle="Do these jobs in the week shown and everything else takes care of itself."
      >
        <ol className="space-y-3">
          {visibleWeeks.map((w) => (
            <li key={w.week} className="rounded-lg border border-border/70 p-4">
              <div className="mb-2 flex items-baseline gap-3">
                <span className="font-display text-lg">Week {w.week}</span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  from {formatDate(w.date)}
                </span>
              </div>
              <ul className="space-y-1.5">
                {w.tasks.map((t, i) => (
                  <li key={`${t.text}-${i}`} className="flex flex-wrap items-start gap-2 text-sm">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${KIND_STYLE[t.kind]}`}
                    >
                      {t.kind}
                    </span>
                    <span className="flex-1 text-muted-foreground">{t.text}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        {weeks.length > 12 ? (
          <Button variant="outline" className="mt-4" onClick={() => setShowAllWeeks((v) => !v)}>
            {showAllWeeks ? "Show fewer weeks" : `Show all ${weeks.length} active weeks`}
          </Button>
        ) : null}
      </Section>

      <Section
        icon={<ShoppingBasket className="h-6 w-6" />}
        title="What to harvest, and when"
        subtitle="First pickings from the earliest sowing of each crop."
      >
        <div className="space-y-2">
          {[...plan.harvests]
            .sort((a, b) => a.startWeek - b.startWeek)
            .map((h, i) => (
              <div
                key={`${h.cropName}-${i}`}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border/70 px-4 py-3"
              >
                <div>
                  <span className="font-medium">{h.cropName}</span>
                  <span className="ml-2 text-sm text-muted-foreground">{h.note}</span>
                </div>
                <span className="text-sm text-primary">
                  {formatDate(h.startDate)} – {formatDate(h.endDate)}
                </span>
              </div>
            ))}
        </div>
      </Section>
    </div>
  );
}
