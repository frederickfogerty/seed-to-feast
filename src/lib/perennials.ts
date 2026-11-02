import type { PlannerInput } from "@/lib/plan";

export interface Perennial {
  id: string;
  name: string;
  kind: "Vegetable" | "Herb" | "Fruit";
  difficulty: 1 | 2 | 3;
  spacingCm: number;
  plantWhen: string;
  firstHarvest: string;
  harvestWhen: string;
  lifespan: string;
  tip: string;
  greenhouseOnly?: boolean;
}

export const PERENNIALS: Perennial[] = [
  { id: "rhubarb", name: "Rhubarb", kind: "Vegetable", difficulty: 1, spacingCm: 90, plantWhen: "Crowns, Nov–Mar", firstHarvest: "Year 2", harvestWhen: "Apr–Jul", lifespan: "10+ years", tip: "Don't pick in year one; stop picking by mid-July so it builds strength." },
  { id: "asparagus", name: "Asparagus", kind: "Vegetable", difficulty: 2, spacingCm: 45, plantWhen: "Crowns, Mar–Apr", firstHarvest: "Year 3", harvestWhen: "Late Apr–mid Jun", lifespan: "20 years", tip: "Weed-free bed is everything. Patience in years one and two pays for decades." },
  { id: "artichoke", name: "Globe artichoke", kind: "Vegetable", difficulty: 2, spacingCm: 90, plantWhen: "Offsets, Apr–May", firstHarvest: "Year 2", harvestWhen: "Jun–Sep", lifespan: "5 years", tip: "Mulch the crowns over winter in cold spots." },
  { id: "kale-perennial", name: "Perennial kale (Daubenton's)", kind: "Vegetable", difficulty: 1, spacingCm: 90, plantWhen: "Cuttings, spring", firstHarvest: "Year 1", harvestWhen: "All year", lifespan: "5–6 years", tip: "Never flowers, so it keeps producing leaves year round." },
  { id: "welsh-onion", name: "Welsh onion", kind: "Vegetable", difficulty: 1, spacingCm: 25, plantWhen: "Clumps, spring", firstHarvest: "Year 1", harvestWhen: "All year", lifespan: "Divide every 3 years", tip: "A perennial spring onion — pull a few stems, the clump regrows." },
  { id: "sorrel", name: "Sorrel", kind: "Vegetable", difficulty: 1, spacingCm: 30, plantWhen: "Seed or plants, spring", firstHarvest: "Year 1", harvestWhen: "Mar–Nov", lifespan: "5 years", tip: "Lemony leaves for salads; cut off flower stalks." },
  { id: "chives", name: "Chives", kind: "Herb", difficulty: 1, spacingCm: 25, plantWhen: "Plants, spring", firstHarvest: "Year 1", harvestWhen: "Mar–Oct", lifespan: "Divide every 3 years", tip: "Flowers are edible and loved by bees." },
  { id: "mint", name: "Mint", kind: "Herb", difficulty: 1, spacingCm: 40, plantWhen: "Plants, spring", firstHarvest: "Year 1", harvestWhen: "Apr–Oct", lifespan: "Indefinite", tip: "Grow in a sunk pot — it spreads everywhere otherwise." },
  { id: "rosemary", name: "Rosemary & thyme", kind: "Herb", difficulty: 1, spacingCm: 50, plantWhen: "Plants, spring", firstHarvest: "Year 1", harvestWhen: "All year", lifespan: "5–10 years", tip: "Sunny, well-drained spot; hates wet winter roots." },
  { id: "strawberry", name: "Strawberries", kind: "Fruit", difficulty: 1, spacingCm: 40, plantWhen: "Runners, Aug–Sep or Mar", firstHarvest: "Year 1–2", harvestWhen: "Jun–Jul", lifespan: "Replace every 3–4 years", tip: "Straw under the fruit keeps it clean; pot up runners for new plants." },
  { id: "raspberry", name: "Raspberries", kind: "Fruit", difficulty: 1, spacingCm: 45, plantWhen: "Canes, Nov–Mar", firstHarvest: "Year 2", harvestWhen: "Jul–Oct", lifespan: "10 years", tip: "Autumn-fruiting types are easiest: cut everything down in February." },
  { id: "currant", name: "Blackcurrant", kind: "Fruit", difficulty: 1, spacingCm: 150, plantWhen: "Bare-root, Nov–Mar", firstHarvest: "Year 2", harvestWhen: "Jul", lifespan: "15 years", tip: "Plant deep to encourage new shoots from the base." },
  { id: "gooseberry", name: "Gooseberry", kind: "Fruit", difficulty: 2, spacingCm: 120, plantWhen: "Bare-root, Nov–Mar", firstHarvest: "Year 2", harvestWhen: "Jun–Jul", lifespan: "15 years", tip: "Prune to an open goblet so air moves and mildew stays away." },
  { id: "fig", name: "Fig", kind: "Fruit", difficulty: 3, spacingCm: 200, plantWhen: "Pot-grown, spring", firstHarvest: "Year 3", harvestWhen: "Aug–Sep", lifespan: "Decades", tip: "Needs warmth — a greenhouse or sunny wall, roots restricted.", greenhouseOnly: true },
];

const MAX_DIFF = { none: 1, some: 2, confident: 3 } as const;

export interface PerennialPick extends Perennial {
  plants: number;
  areaM2: number;
}

/** Roughly 15% of the plot goes to a permanent bed for perennials. */
export function pickPerennials(input: PlannerInput): { patchM2: number; picks: PerennialPick[] } {
  if (!input.categories.includes("perennial")) return { patchM2: 0, picks: [] };
  const patchM2 = Math.max(1, Math.round(input.spaceM2 * 0.15 * 10) / 10);
  const pool = PERENNIALS.filter(
    (p) =>
      p.difficulty <= MAX_DIFF[input.experience] &&
      !input.dislikes.includes(p.id) &&
      (!p.greenhouseOnly || input.greenhouse),
  );
  const picks: PerennialPick[] = [];
  let used = 0;
  for (const p of pool) {
    const per = (p.spacingCm / 100) ** 2;
    const want = p.kind === "Herb" ? 1 : Math.max(1, Math.min(6, Math.round(input.household * (p.spacingCm < 60 ? 2 : 0.5))));
    const n = Math.min(want, Math.floor((patchM2 - used) / per));
    if (n < 1) continue;
    used += n * per;
    picks.push({ ...p, plants: n, areaM2: Math.round(n * per * 10) / 10 });
  }
  return { patchM2, picks };
}
