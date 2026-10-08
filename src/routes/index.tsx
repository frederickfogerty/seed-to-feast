import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getPlan, getProfile, savePlan, type SavedPlan } from "@/lib/plans-api";
import { ArrowLeft, ArrowRight, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { PlanView } from "@/components/PlanView";
import { CATEGORY_LABELS, CROPS, type CropCategory } from "@/lib/crops";
import {
  buildPlan,
  type Climate,
  type Experience,
  type GardenPlan,
  type Hemisphere,
  type PlannerInput,
} from "@/lib/plan";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Plot & Plan — a year of growing, planned for your garden" },
      {
        name: "description",
        content:
          "Tell us your space, tastes, location and experience and get crops, seed quantities, bed-building instructions and a week-by-week growing calendar.",
      },
      { property: "og:title", content: "Plot & Plan — your kitchen garden, planned" },
      {
        property: "og:description",
        content:
          "Crops, seed quantities, bed preparation, a season-by-season planting plan and week-by-week jobs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { edit?: string } =>
    typeof s['edit'] === "string" ? { edit: s['edit'] } : {},
  component: Index,
});

const STEPS = ["Tastes", "Space", "Place", "You"] as const;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function Index() {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<GardenPlan | null>(null);

  const [categories, setCategories] = useState<CropCategory[]>([
    "leafy",
    "root",
    "fruiting",
    "legume",
    "herb",
  ]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [spaceM2, setSpaceM2] = useState(20);
  const [greenhouse, setGreenhouse] = useState(false);
  const [greenhouseM2, setGreenhouseM2] = useState(6);
  const [locationName, setLocationName] = useState("");
  const [hemisphere, setHemisphere] = useState<Hemisphere>("north");
  const [climate, setClimate] = useState<Climate>("temperate");
  const [experience, setExperience] = useState<Experience>("none");
  const [household, setHousehold] = useState(2);

  const { edit } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<SavedPlan | null>(null);
  const [planName, setPlanName] = useState("");
  const [saving, setSaving] = useState(false);
  const [planYear, setPlanYear] = useState(2026);

  const applyInput = (i: PlannerInput) => {
    setCategories(i.categories);
    setDislikes(i.dislikes);
    setExtras(i.extras ?? []);
    setSpaceM2(i.spaceM2);
    setGreenhouse(i.greenhouse);
    setGreenhouseM2(i.greenhouseM2);
    setLocationName(i.locationName);
    setHemisphere(i.hemisphere);
    setClimate(i.climate);
    setExperience(i.experience);
    setHousehold(i.household);
  };

  useEffect(() => {
    if (!user) return;
    if (edit) {
      getPlan(edit)
        .then((p) => {
          setEditing(p);
          setPlanName(p.name);
          applyInput(p.input);
        })
        .catch(() => toast.error("Couldn't load that plan"));
    } else {
      getProfile().then((p) => {
        if (!p) return;
        if (p.location_name) setLocationName(p.location_name);
        if (p.hemisphere === "north" || p.hemisphere === "south") setHemisphere(p.hemisphere);
        if (["cool", "temperate", "warm"].includes(p.climate)) setClimate(p.climate as Climate);
      });
    }
  }, [user, edit]);

  const toggle = <T,>(list: T[], value: T, set: (v: T[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const currentInput = (): PlannerInput => ({
    categories,
    dislikes,
    extras,
    spaceM2,
    hemisphere,
    climate,
    locationName,
    greenhouse,
    greenhouseM2,
    experience,
    household,
  });

  const generate = () => {
    const year = editing?.season_year ?? new Date().getUTCFullYear();
    setPlanYear(year);
    setPlan(buildPlan(currentInput(), year));
    if (!planName) setPlanName(locationName ? `${locationName} garden` : "My garden");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const save = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      const id = await savePlan({
        id: editing?.id,
        name: planName.trim() || "My garden",
        season_year: planYear,
        input: currentInput(),
        notes: editing?.notes ?? null,
      });
      toast.success(editing ? "Plan updated" : "Plan saved");
      navigate({ to: "/plans/$id", params: { id } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (plan) {
    return (
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <div className="paper flex flex-wrap items-end gap-3 rounded-xl p-5">
          {user ? (
            <>
              <div className="min-w-[220px] flex-1">
                <Label htmlFor="pname">Plan name</Label>
                <Input id="pname" className="mt-2" maxLength={80} value={planName} onChange={(e) => setPlanName(e.target.value)} />
              </div>
              <Button onClick={save} disabled={saving}>
                {editing ? "Update saved plan" : `Save plan for ${planYear}`}
              </Button>
            </>
          ) : (
            <>
              <p className="flex-1 text-sm text-muted-foreground">
                Want to keep this plan and come back to it next season?
              </p>
              <Button asChild>
                <Link to="/auth">Sign in to save</Link>
              </Button>
            </>
          )}
        </div>
        <PlanView plan={plan} onRestart={() => setPlan(null)} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">
          <Sprout className="h-3.5 w-3.5" /> Plot &amp; Plan
        </span>
        <h1 className="mt-4 text-4xl sm:text-5xl">Grow a year's worth of food</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Four quick questions and you'll get your crop list, how much seed to buy, how to build the
          beds, and what to do every week from first sowing to last harvest.
        </p>
      </div>

      <div className="paper rounded-xl p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col gap-1.5">
              <div
                className={`h-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}
                aria-hidden
              />
              <span
                className={`text-xs ${i === step ? "text-primary" : "text-muted-foreground"}`}
              >
                {s}
              </span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl">What do you actually like eating?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick the groups worth the space in your kitchen.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(Object.keys(CATEGORY_LABELS) as CropCategory[]).filter((c) => c !== "flower").map((c) => (
                  <Chip
                    key={c}
                    active={categories.includes(c)}
                    onClick={() => toggle(categories, c, setCategories)}
                  >
                    {CATEGORY_LABELS[c]}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg">Anything you would really like to grow?</h3>
              <p className="mt-1 text-sm text-muted-foreground">These always make it into your plan.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(EXTRA_LABELS) as Extra[]).map((e) => (
                  <Chip key={e} active={extras.includes(e)} onClick={() => toggle(extras, e, setExtras)}>
                    {EXTRA_LABELS[e]}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg">Anything you'd rather not grow?</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {CROPS.filter((c) => categories.includes(c.category)).map((c) => (
                  <Chip
                    key={c.id}
                    active={dislikes.includes(c.id)}
                    onClick={() => toggle(dislikes, c.id, setDislikes)}
                  >
                    {dislikes.includes(c.id) ? "✕ " : ""}
                    {c.name}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl">How much ground can you give it?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Include paths — we'll set aside a quarter of it for walking room.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Slider
                  value={[spaceM2]}
                  min={2}
                  max={200}
                  step={1}
                  onValueChange={(v) => setSpaceM2(v[0] ?? 20)}
                  className="flex-1"
                />
                <span className="w-24 text-right font-display text-2xl">{spaceM2} m²</span>
              </div>
            </div>
            <div className="rounded-lg border border-border/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-base">Greenhouse or polytunnel?</Label>
                  <p className="text-sm text-muted-foreground">
                    Unlocks winter salads, chillies and much earlier sowings.
                  </p>
                </div>
                <Switch checked={greenhouse} onCheckedChange={setGreenhouse} />
              </div>
              {greenhouse && (
                <div className="mt-5 flex items-center gap-4">
                  <Slider
                    value={[greenhouseM2]}
                    min={2}
                    max={40}
                    step={1}
                    onValueChange={(v) => setGreenhouseM2(v[0] ?? 6)}
                    className="flex-1"
                  />
                  <span className="w-24 text-right font-display text-xl">{greenhouseM2} m²</span>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl">Where are you growing?</h2>
              <Label htmlFor="loc" className="mt-4 block">
                Town or area
              </Label>
              <Input
                id="loc"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Galway"
                className="mt-2"
                maxLength={60}
              />
            </div>
            <div>
              <Label className="block">Half of the world</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["north", "south"] as Hemisphere[]).map((h) => (
                  <Chip key={h} active={hemisphere === h} onClick={() => setHemisphere(h)}>
                    {h === "north" ? "Northern hemisphere" : "Southern hemisphere"}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <Label className="block">Your climate</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    ["cool", "Cool — late springs, frost into May"],
                    ["temperate", "Temperate — mild, four clear seasons"],
                    ["warm", "Warm — early springs, hot summers"],
                  ] as [Climate, string][]
                ).map(([value, label]) => (
                  <Chip key={value} active={climate === value} onClick={() => setClimate(value)}>
                    {label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl">How much growing have you done?</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  [
                    ["none", "First time"],
                    ["some", "A season or two"],
                    ["confident", "Confident gardener"],
                  ] as [Experience, string][]
                ).map(([value, label]) => (
                  <Chip
                    key={value}
                    active={experience === value}
                    onClick={() => setExperience(value)}
                  >
                    {label}
                  </Chip>
                ))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Beginners get the forgiving crops only; confident gardeners get the fussy ones too.
              </p>
            </div>
            <div>
              <Label className="block">People to feed</Label>
              <div className="mt-3 flex items-center gap-4">
                <Slider
                  value={[household]}
                  min={1}
                  max={8}
                  step={1}
                  onValueChange={(v) => setHousehold(v[0] ?? 2)}
                  className="flex-1"
                />
                <span className="w-16 text-right font-display text-2xl">{household}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && categories.length === 0}
            >
              Next <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={generate}>
              Make my plan <Sprout className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
