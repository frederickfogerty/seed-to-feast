import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deletePlan, getProfile, listPlans, updateProfile, type Profile } from "@/lib/plans-api";

export const Route = createFileRoute("/_authenticated/plans")({
  head: () => ({
    meta: [
      { title: "My garden plans — Plot & Plan" },
      { name: "description", content: "Your saved growing plans, season by season." },
      { property: "og:title", content: "My garden plans — Plot & Plan" },
      { property: "og:description", content: "Your saved growing plans, season by season." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlansPage,
});

function ProfileCard() {
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const [form, setForm] = useState<Omit<Profile, "id">>({
    display_name: "",
    location_name: "",
    hemisphere: "north",
    climate: "temperate",
  });
  useEffect(() => {
    if (profile)
      setForm({
        display_name: profile.display_name ?? "",
        location_name: profile.location_name ?? "",
        hemisphere: profile.hemisphere,
        climate: profile.climate,
      });
  }, [profile]);
  const qc = useQueryClient();
  const save = async () => {
    try {
      await updateProfile(form);
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const sel = "mt-2 h-9 w-full rounded-md border border-input bg-background px-3 text-sm";
  return (
    <section className="paper rounded-xl p-6">
      <h2 className="text-2xl">Your profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">Your location and climate are filled in for every new plan.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="dn">Name</Label>
          <Input id="dn" className="mt-2" maxLength={60} value={form.display_name ?? ""} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="ln">Town or area</Label>
          <Input id="ln" className="mt-2" maxLength={60} value={form.location_name ?? ""} onChange={(e) => setForm({ ...form, location_name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="hs">Hemisphere</Label>
          <select id="hs" className={sel} value={form.hemisphere} onChange={(e) => setForm({ ...form, hemisphere: e.target.value })}>
            <option value="north">Northern</option>
            <option value="south">Southern</option>
          </select>
        </div>
        <div>
          <Label htmlFor="cl">Climate</Label>
          <select id="cl" className={sel} value={form.climate} onChange={(e) => setForm({ ...form, climate: e.target.value })}>
            <option value="cool">Cool</option>
            <option value="temperate">Temperate</option>
            <option value="warm">Warm</option>
          </select>
        </div>
      </div>
      <Button className="mt-4" onClick={save}>Save profile</Button>
    </section>
  );
}

function PlansPage() {
  const qc = useQueryClient();
  const { data: plans = [], isLoading } = useQuery({ queryKey: ["plans"], queryFn: listPlans });
  const years = [...new Set(plans.map((p) => p.season_year))];

  const remove = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    await deletePlan(id);
    qc.invalidateQueries({ queryKey: ["plans"] });
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl">My garden plans</h1>
        <Button asChild>
          <Link to="/">Make a new plan</Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : plans.length === 0 ? (
        <div className="paper rounded-xl p-6 text-muted-foreground">
          No saved plans yet. Make a plan and press “Save plan” to keep it here.
        </div>
      ) : (
        years.map((y) => (
          <section key={y}>
            <h2 className="mb-3 text-2xl">{y} season</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {plans
                .filter((p) => p.season_year === y)
                .map((p) => (
                  <div key={p.id} className="paper flex items-start justify-between gap-3 rounded-xl p-5">
                    <Link to="/plans/$id" params={{ id: p.id }} className="flex-1">
                      <div className="font-display text-xl">{p.name}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {p.input.spaceM2} m²{p.input.greenhouse ? " + greenhouse" : ""} · {p.input.household} people ·
                        updated {new Date(p.updated_at).toLocaleDateString()}
                      </div>
                    </Link>
                    <Button variant="ghost" size="icon" aria-label="Delete plan" onClick={() => remove(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </section>
        ))
      )}

      <ProfileCard />
    </main>
  );
}
