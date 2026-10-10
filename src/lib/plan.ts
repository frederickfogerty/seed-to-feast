import { CROPS, type Crop, type CropCategory } from "./crops";

export type Experience = "none" | "some" | "confident";
export type Climate = "cool" | "temperate" | "warm";
export type Hemisphere = "north" | "south";

export interface PlannerInput {
  categories: CropCategory[];
  dislikes: string[];
  spaceM2: number;
  hemisphere: Hemisphere;
  climate: Climate;
  locationName: string;
  greenhouse: boolean;
  greenhouseM2: number;
  experience: Experience;
  household: number;
  /** 0–100: share of the outdoor growing area built as raised beds; the rest is in-ground. */
  raisedBedPercent: number;
}

export interface CropPlan {
  crop: Crop;
  areaM2: number;
  plants: number;
  seeds: number;
  packets: number;
  underCover: boolean;
  estimatedYieldKg: number;
}

export interface WeekTask {
  week: number;
  date: Date;
  kind: "prep" | "sow" | "plant" | "care" | "harvest";
  text: string;
  cropId?: string;
}

export interface HarvestEntry {
  cropName: string;
  startWeek: number;
  endWeek: number;
  startDate: Date;
  endDate: Date;
  note: string;
}

export interface GardenPlan {
  input: PlannerInput;
  crops: CropPlan[];
  beds: BedPlan;
  tasks: WeekTask[];
  harvests: HarvestEntry[];
  seasons: { season: string; items: string[] }[];
  totalYieldKg: number;
}

export interface BedPlan {
  bedCount: number;
  raisedBedCount: number;
  inGroundBedCount: number;
  bedWidthM: number;
  bedLengthM: number;
  pathWidthCm: number;
  growingAreaM2: number;
  orientation: string;
  fertility: string[];
  tools: string[];
  steps: { title: string; detail: string; hours: number }[];
  totalHours: number;
}

const EXPERIENCE_MAX_DIFFICULTY: Record<Experience, number> = {
  none: 1,
  some: 2,
  confident: 3,
};

/** Shift a baseline (temperate, northern) week to the gardener's conditions. */
export function shiftWeek(week: number, input: PlannerInput): number {
  const climateShift = input.climate === "cool" ? 2 : input.climate === "warm" ? -2 : 0;
  const hemisphereShift = input.hemisphere === "south" ? 26 : 0;
  let w = week + climateShift + hemisphereShift;
  while (w > 52) w -= 52;
  while (w < 1) w += 52;
  return w;
}

export function weekToDate(week: number, year: number): Date {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const d = new Date(jan1.getTime() + (week - 1) * 7 * 86400000);
  return d;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

function seasonOfWeek(week: number, hemisphere: Hemisphere): string {
  const w = hemisphere === "south" ? ((week + 25) % 52) + 1 : week;
  if (w <= 8 || w >= 48) return "Winter";
  if (w <= 21) return "Spring";
  if (w <= 34) return "Summer";
  return "Autumn";
}

export function buildPlan(input: PlannerInput, year: number): GardenPlan {
  const maxDifficulty = EXPERIENCE_MAX_DIFFICULTY[input.experience];

  const eligible = CROPS.filter((c) => {
    if (input.dislikes.includes(c.id)) return false;
    if (!input.categories.includes(c.category)) return false;
    if (c.difficulty > maxDifficulty) return false;
    if (c.greenhouseOnly && !input.greenhouse) return false;
    return true;
  });

  // Score: easy, productive, long-cropping plants first.
  const scored = [...eligible].sort((a, b) => {
    const score = (c: Crop) =>
      (4 - c.difficulty) * 2 + c.harvestWeeks / 6 + c.yieldPerPlantKg / 2;
    return score(b) - score(a);
  });

  // 75% of the plot is growing beds, the rest paths and edges.
  const growingAreaM2 = Math.max(1, input.spaceM2 * 0.75);
  const coverArea = input.greenhouse ? Math.max(0, input.greenhouseM2) * 0.7 : 0;

  // How many different crops is sensible for the space and the gardener?
  const capacity = Math.min(
    scored.length,
    Math.max(3, Math.round(growingAreaM2 / 2) + (input.experience === "none" ? 0 : 3)),
  );
  const chosen = scored.slice(0, capacity);

  let outdoorLeft = growingAreaM2;
  let coverLeft = coverArea;
  const householdFactor = Math.max(0.6, Math.min(2.5, input.household / 2));

  const weights = chosen.map((c) => (c.harvestWeeks > 10 ? 1.4 : 1) * (c.fertility === "hungry" ? 1.2 : 1));
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const cropPlans: CropPlan[] = chosen.map((crop, i) => {
    const wantsCover = crop.greenhouseOnly || (input.greenhouse && crop.id === "tomato");
    const share = (weights[i] ?? 1) / weightSum;
    let area: number;
    let underCover = false;
    if (wantsCover && coverLeft > 0.5) {
      area = Math.min(coverLeft, Math.max(0.5, coverArea * share * 1.4));
      coverLeft -= area;
      underCover = true;
    } else {
      area = Math.max(0.4, growingAreaM2 * share);
      area = Math.min(area, Math.max(0.4, outdoorLeft));
      outdoorLeft -= area;
    }
    area = Math.round(area * 10) / 10;

    const perPlantM2 = (crop.spacingCm / 100) ** 2;
    const plants = Math.max(1, Math.round((area / perPlantM2) * Math.min(1.4, householdFactor)));
    const seeds = Math.ceil(plants * crop.seedFactor);
    const packets = Math.max(1, Math.ceil(seeds / crop.packetSeeds));
    return {
      crop,
      areaM2: area,
      plants,
      seeds,
      packets,
      underCover,
      estimatedYieldKg: Math.round(plants * crop.yieldPerPlantKg * 10) / 10,
    };
  });

  const beds = buildBedPlan(input, cropPlans, growingAreaM2);
  const { tasks, harvests } = buildCalendar(input, cropPlans, year, beds);

  const seasons = ["Spring", "Summer", "Autumn", "Winter"].map((season) => ({
    season,
    items: tasks
      .filter((t) => seasonOfWeek(t.week, input.hemisphere) === season && t.kind !== "care")
      .slice(0, 14)
      .map((t) => `Week ${t.week} (${formatDate(t.date)}) — ${t.text}`),
  }));

  return {
    input,
    crops: cropPlans,
    beds,
    tasks,
    harvests,
    seasons,
    totalYieldKg: Math.round(cropPlans.reduce((a, c) => a + c.estimatedYieldKg, 0)),
  };
}

function buildBedPlan(input: PlannerInput, crops: CropPlan[], growingAreaM2: number): BedPlan {
  const bedWidthM = 1.2;
  const bedLengthM = Math.min(6, Math.max(2, Math.round((growingAreaM2 / bedWidthM / 2) * 2) / 2));
  const bedCount = Math.max(1, Math.round(growingAreaM2 / (bedWidthM * bedLengthM)));

  const raisedShare = Math.max(0, Math.min(100, input.raisedBedPercent)) / 100;
  const raisedBedCount = Math.round(bedCount * raisedShare);
  const inGroundBedCount = bedCount - raisedBedCount;
  const raisedAreaM2 = growingAreaM2 * raisedShare;
  const inGroundAreaM2 = growingAreaM2 - raisedAreaM2;

  const hungry = crops.filter((c) => c.crop.fertility === "hungry").map((c) => c.crop.name);
  const light = crops.filter((c) => c.crop.fertility === "light").map((c) => c.crop.name);

  const splitDesc =
    inGroundBedCount === 0
      ? `${bedCount} raised bed${bedCount > 1 ? "s" : ""}`
      : raisedBedCount === 0
        ? `${bedCount} in-ground bed${bedCount > 1 ? "s" : ""}`
        : `${raisedBedCount} raised and ${inGroundBedCount} in-ground bed${bedCount > 1 ? "s" : ""}`;

  const orientation =
    input.hemisphere === "north"
      ? "Run the beds north to south so the sun travels along them and tall plants at the north end never shade the rest. Put beans, sweetcorn and greenhouse crops on the north side of the plot."
      : "Run the beds north to south, and keep the tall crops (beans, sweetcorn) on the south side of the plot so they don't shade everything else.";

  const digHoursPerM2 = input.experience === "none" ? 1.6 : input.experience === "some" ? 1.2 : 0.9;
  const steps = [
    {
      title: "Mark out and clear",
      detail: `Peg out ${splitDesc} of ${bedWidthM} m × ${bedLengthM} m with string, leaving 45 cm paths between them so you can kneel and push a barrow through. Strim or scalp the grass/weeds right down.`,
      hours: Math.round(growingAreaM2 * 0.15 * 10) / 10,
    },
    {
      title: "Smother the weeds",
      detail:
        "Lay plain cardboard over each bed footprint, overlapping the edges by 15 cm, and soak it with water. This kills grass without digging and rots away by summer.",
      hours: Math.round(growingAreaM2 * 0.08 * 10) / 10,
    },
    ...(raisedBedCount > 0
      ? [
          {
            title: "Build the raised frames",
            detail: `For the ${raisedBedCount} raised bed${raisedBedCount > 1 ? "s" : ""}: screw scaffold boards or sleepers into rectangles 20–30 cm deep, corner posts knocked in to hold them. No need to dig the base — the cardboard underneath does that work.`,
            hours: Math.round(raisedBedCount * 2.5 * 10) / 10,
          },
          {
            title: "Fill the raised beds",
            detail: `Fill each frame with a 50/50 mix of topsoil and compost — roughly ${Math.round(raisedAreaM2 * 0.25 * 10) / 10} m³ for a 25 cm depth, about ${Math.ceil((raisedAreaM2 * 0.25 * 1000) / 50)} bags of 50 L compost if you're buying it in.`,
            hours: Math.round(raisedAreaM2 * digHoursPerM2 * 0.6 * 10) / 10,
          },
        ]
      : []),
    ...(inGroundBedCount > 0
      ? [
          {
            title: "Shape the in-ground beds",
            detail: `For the ${inGroundBedCount} in-ground bed${inGroundBedCount > 1 ? "s" : ""}: mound the soil into flat-topped beds with sloped sides, or just mark the edges with a line of sand. No frames to build — the paths stay at ground level.`,
            hours: Math.round(inGroundBedCount * 0.6 * 10) / 10,
          },
          {
            title: "Feed the in-ground beds",
            detail: `Spread 8–10 cm of compost or well-rotted manure over the cardboard — roughly ${Math.round(inGroundAreaM2 * 0.09 * 10) / 10} m³ in total, about ${Math.ceil((inGroundAreaM2 * 0.09 * 1000) / 50)} bags of 50 L compost. Rake it level; you sow straight into it.`,
            hours: Math.round(inGroundAreaM2 * digHoursPerM2 * 0.4 * 10) / 10,
          },
        ]
      : []),
    {
      title: "Set up water and paths",
      detail:
        "Get a water butt or hose within reach of every bed, and mulch the paths with woodchip or cardboard so they don't become weed nurseries.",
      hours: 2,
    },
  ];

  const fertility = [
    "Get a £10 pH test kit: most vegetables want pH 6.0–7.0. Lime only if it reads below 6.0.",
    hungry.length
      ? `Hungry feeders (${hungry.slice(0, 4).join(", ")}) get an extra bucket of compost per square metre before planting, plus a liquid feed every 10–14 days once cropping.`
      : "Top up each bed with 5 cm of compost every autumn and you'll rarely need bagged fertiliser.",
    light.length
      ? `Keep ${light.slice(0, 4).join(", ")} on the bed that was manured last year — fresh manure gives forked roots and leafy, tasteless growth.`
      : "Avoid fresh manure directly before root crops.",
    "Rotate: move the cabbage family, the onion family, roots and legumes on by one bed each year to break pest and disease cycles.",
  ];

  const tools = [
    "Garden fork and a spade",
    "Rake (levelling seedbeds)",
    "Hand trowel and hand fork",
    "Draw hoe or oscillating hoe — the single biggest time-saver for weeds",
    "Watering can with a fine rose, plus a hose or water butt",
    "Garden line (string and two pegs) for straight rows",
    "Seed trays, module trays and a bag of peat-free seed compost",
    "Labels and a pencil",
    ...(raisedBedCount > 0
      ? ["Saw, drill and screws for the raised-bed frames", "Spirit level to keep the frames true"]
      : []),
    input.greenhouse ? "Greenhouse thermometer and shade netting for July/August" : "Fleece or a cloche for late frosts",
    crops.some((c) => c.crop.category === "brassica") ? "Fine insect mesh and hoops (brassicas and carrots)" : "Slug defence of your choice",
  ];

  const totalHours = Math.round(steps.reduce((a, s) => a + s.hours, 0));
  return {
    bedCount,
    raisedBedCount,
    inGroundBedCount,
    bedWidthM,
    bedLengthM,
    pathWidthCm: 45,
    growingAreaM2: Math.round(growingAreaM2 * 10) / 10,
    orientation,
    fertility,
    tools,
    steps,
    totalHours,
  };
}

function buildCalendar(
  input: PlannerInput,
  crops: CropPlan[],
  year: number,
  beds: BedPlan,
): { tasks: WeekTask[]; harvests: HarvestEntry[] } {
  const tasks: WeekTask[] = [];
  const harvests: HarvestEntry[] = [];
  const add = (week: number, kind: WeekTask["kind"], text: string, cropId?: string) => {
    let w = week;
    while (w > 52) w -= 52;
    while (w < 1) w += 52;
    tasks.push({ week: w, date: weekToDate(w, year), kind, text, cropId: cropId ?? "" });
  };

  // Bed preparation, a few weeks before the first sowing.
  const prepStart = shiftWeek(6, input);
  beds.steps.forEach((s, i) => {
    add(prepStart + i, "prep", `${s.title} — ${s.hours} h`);
  });

  for (const plan of crops) {
    const crop = plan.crop;
    const windows = [
      ...crop.sowOutside.map((w) => ({ w, cover: false })),
      ...(input.greenhouse ? crop.sowUnderCover.map((w) => ({ w, cover: true })) : []),
    ];
    for (const { w, cover } of windows) {
      const start = shiftWeek(w[0], input);
      const end = shiftWeek(w[1], input);
      const span = ((end - start + 52) % 52) || 1;
      const step = crop.successionWeeks ?? Math.max(span, 1);
      const seedsPerSowing = crop.successionWeeks
        ? Math.max(1, Math.round(plan.seeds / Math.max(1, Math.floor(span / step) + 1)))
        : plan.seeds;

      for (let offset = 0; offset <= span; offset += step) {
        const sowWeek = start + offset;
        add(
          sowWeek,
          "sow",
          `Sow ${crop.name} — about ${seedsPerSowing} seeds${cover ? " in trays in the greenhouse" : ", direct in the bed"}.`,
          crop.id,
        );
        if (cover) {
          add(sowWeek + 5, "plant", `Plant out the ${crop.name} once the roots fill the module and frosts have passed.`, crop.id);
        }
        add(sowWeek + Math.round(crop.weeksToHarvest * 0.5), "care", `Check ${crop.name}: thin, weed, water and feed.`, crop.id);

        const hStart = sowWeek + crop.weeksToHarvest;
        const hEnd = hStart + crop.harvestWeeks;
        add(hStart, "harvest", `Start harvesting ${crop.name}. ${crop.tip}`, crop.id);
        if (offset === 0) {
          harvests.push({
            cropName: crop.name,
            startWeek: ((hStart - 1) % 52) + 1,
            endWeek: ((hEnd - 1) % 52) + 1,
            startDate: weekToDate(((hStart - 1) % 52) + 1, year),
            endDate: weekToDate(((hEnd - 1) % 52) + 1, year),
            note: crop.tip,
          });
        }
      }
    }
  }

  tasks.sort((a, b) => a.week - b.week || a.kind.localeCompare(b.kind));
  return { tasks, harvests };
}

export function tasksByWeek(tasks: WeekTask[]): { week: number; date: Date; tasks: WeekTask[] }[] {
  const map = new Map<number, WeekTask[]>();
  for (const t of tasks) {
    const list = map.get(t.week) ?? [];
    list.push(t);
    map.set(t.week, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([week, list]) => ({ week, date: list[0]?.date ?? weekToDate(week, new Date().getUTCFullYear()), tasks: list }));
}
