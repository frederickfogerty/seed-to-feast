import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlanView } from "@/components/PlanView";
import { buildPlan } from "@/lib/plan";
import { getPlan, savePlan } from "@/lib/plans-api";

export const Route = createFileRoute("/_authenticated/plans/$id")({
  head: () => ({
    meta: [
      { title: "Saved plan — Plot & Plan" },
      { name: "description", content: "Revisit and update a saved garden plan." },
      { property: "og:title", content: "Saved plan — Plot & Plan" },
      { property: "og:description", content: "Revisit and update a saved garden plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SavedPlanPage,
});

function SavedPlanPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["plan", id], queryFn: () => getPlan(id) });
  const [name, setName] = useState("");
  const [year, setYear] = useState(2026);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.name);
      setYear(data.season_year);
      setNotes(data.notes ?? "");
    }
  }, [data]);

  const plan = useMemo(() => (data ? buildPlan(data.input, year) : null), [data, year]);

  if (isLoading) return <main className="mx-auto max-w-5xl p-10 text-muted-foreground">Loading…</main>;
  if (error || !data || !plan)
    return (
      <main className="mx-auto max-w-5xl p-10">
        <p>That plan couldn't be found.</p>
        <Link to="/plans" className="text-primary underline">Back to my plans</Link>
      </main>
    );

  const save = async () => {
    try {
      await savePlan({ id, name: name.trim() || data.name, season_year: year, input: data.input, notes });
      qc.invalidateQueries({ queryKey: ["plans"] });
      qc.invalidateQueries({ queryKey: ["plan", id] });
      toast.success("Plan updated");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const copyNext = async () => {
    const newId = await savePlan({
      name: `${data.name} (${data.season_year + 1})`,
      season_year: data.season_year + 1,
      input: data.input,
    });
    qc.invalidateQueries({ queryKey: ["plans"] });
    toast.success(`Copied to the ${data.season_year + 1} season`);
    navigate({ to: "/plans/$id", params: { id: newId } });
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <section className="paper rounded-xl p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <div>
            <Label htmlFor="nm">Plan name</Label>
            <Input id="nm" className="mt-2" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="yr">Season</Label>
            <Input id="yr" type="number" className="mt-2" min={2000} max={2100} value={year} onChange={(e) => setYear(Number(e.target.value) || year)} />
          </div>
        </div>
        <Label htmlFor="nt" className="mt-4 block">Notes for this season</Label>
        <Textarea id="nt" className="mt-2" maxLength={4000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What worked, what didn't, varieties you tried…" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={save}>Save changes</Button>
          <Button variant="outline" asChild>
            <Link to="/" search={{ edit: id }}>Change my answers</Link>
          </Button>
          <Button variant="outline" onClick={copyNext}>Copy to {data.season_year + 1} season</Button>
        </div>
      </section>
      <PlanView plan={plan} onRestart={() => navigate({ to: "/" })} />
    </main>
  );
}
