import type { CropCategory } from "./crops";

export interface ProtectionGuide {
  family: string;
  pests: string[];
  prevent: string[];
  companions: string[];
}

/** Organic protection & companion advice per crop family. */
export const PROTECTION: Partial<Record<CropCategory, ProtectionGuide>> = {
  brassica: {
    family: "Cabbage family",
    pests: ["Cabbage white caterpillars", "Cabbage root fly", "Pigeons", "Slugs", "Clubroot"],
    prevent: [
      "Cover with fine insect mesh (5–7 mm or finer) on hoops from planting out — tuck the edges in so butterflies can't get under.",
      "Check leaf undersides weekly from May to September and squash yellow egg clusters.",
      "Fit felt collars around stems at planting to stop root fly laying eggs.",
      "Lime acid soil and keep a 4-year rotation to keep clubroot away.",
    ],
    companions: ["Nasturtiums (sacrificial crop for caterpillars)", "Dill and coriander (draw in parasitic wasps)", "Onions and garlic nearby"],
  },
  root: {
    family: "Roots & tubers",
    pests: ["Carrot fly", "Wireworm", "Potato blight", "Slugs"],
    prevent: [
      "Put a 60 cm high fine-mesh barrier or fleece over carrots — carrot fly stays low.",
      "Sow thinly to avoid thinning, which releases the scent that draws carrot fly; thin in the evening if you must.",
      "Watch for blight in warm, wet spells (July–August); cut off potato foliage at the first brown patches.",
      "Grow blight-resistant potatoes such as Sarpo Mira.",
    ],
    companions: ["Onions or chives beside carrots to mask their scent", "Calendula to bring in hoverflies"],
  },
  leafy: {
    family: "Salads & leaves",
    pests: ["Slugs and snails", "Aphids", "Birds"],
    prevent: [
      "Go out at dusk after rain with a torch and pick slugs off; leave wildlife ponds and log piles for frogs and beetles.",
      "Use wool pellets or a ring of grit around young plants.",
      "Rub off aphids by hand or hose them off; ladybirds and hoverflies will follow.",
      "Cover new sowings with fleece or netting against birds.",
    ],
    companions: ["Chives and garlic", "Calendula and phacelia for predators", "Radish as a quick row marker"],
  },
  allium: {
    family: "Onions & garlic",
    pests: ["Allium leaf miner", "Onion fly", "Rust", "Birds pulling sets"],
    prevent: [
      "Cover leeks and onions with fine mesh in March–April and again in September–October when leaf miner flies.",
      "Grow onions from sets and net them for the first few weeks so birds don't pull them up.",
      "Space plants well for airflow to reduce rust; don't overfeed with nitrogen.",
    ],
    companions: ["Carrots (each masks the other's scent)", "Beetroot", "Chamomile"],
  },
  legume: {
    family: "Peas & beans",
    pests: ["Blackfly on broad beans", "Pea moth", "Mice", "Slugs on young beans"],
    prevent: [
      "Pinch out broad bean tips once the first pods set — blackfly gather there.",
      "Sow peas early or late to miss the main pea moth flight (June–July), or cover with mesh.",
      "Start beans in pots and plant them out sturdy so slugs and mice can't take them.",
    ],
    companions: ["Summer savory with broad beans", "Sweet peas to draw pollinators", "Sweetcorn and squash (three sisters)"],
  },
  fruiting: {
    family: "Fruiting veg",
    pests: ["Whitefly", "Red spider mite", "Aphids", "Tomato blight", "Slugs on courgettes"],
    prevent: [
      "Keep the greenhouse humid and damp down paths on hot days to keep red spider mite away.",
      "Hang yellow sticky traps for whitefly; open vents for airflow.",
      "Water at the base, not the leaves, and remove lower tomato leaves to slow blight.",
      "Protect young courgettes with a ring of wool pellets or a cut-down bottle.",
    ],
    companions: ["French marigolds (tagetes) beside tomatoes against whitefly", "Basil with tomatoes", "Nasturtiums under cucumbers and courgettes"],
  },
  herb: {
    family: "Herbs",
    pests: ["Aphids", "Slugs on basil and parsley", "Carrot fly on parsley"],
    prevent: [
      "Grow basil under cover where slugs are fewer.",
      "Let a few herbs flower — they feed hoverflies and parasitic wasps that protect the whole garden.",
    ],
    companions: ["Most crops benefit — scatter herbs through the beds"],
  },
  perennial: {
    family: "Perennials & fruit",
    pests: ["Birds on soft fruit", "Gooseberry sawfly", "Asparagus beetle", "Slugs on strawberries"],
    prevent: [
      "Net soft fruit or build a simple fruit cage before berries colour.",
      "Check gooseberry leaves from April for sawfly larvae and pick them off.",
      "Mulch strawberries with straw to keep fruit clean and off the soil.",
      "Hand-pick asparagus beetles in late spring.",
    ],
    companions: ["Comfrey (feed and pollinators)", "Chives under fruit bushes", "Borage for bees"],
  },
};

export const GENERAL_PRINCIPLES = [
  "Healthy soil grows strong plants that shrug off pests — keep adding compost.",
  "Grow flowers among the veg (calendula, phacelia, borage, nasturtium) to bring in predators and pollinators.",
  "Rotate crop families each year so pests and diseases can't build up.",
  "Barriers beat sprays: mesh, fleece and collars stop most problems before they start.",
  "Leave habitat — a log pile, a small pond, a wild corner — for frogs, hedgehogs, beetles and birds.",
];
