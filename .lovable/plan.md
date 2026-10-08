# Add "Anything you would really like to grow?" question

## What the gardener sees
- A new question in the planner: **"Anything you would really like to grow?"** with three tick-chips: **Pumpkin**, **Sweetcorn**, **Flowers**. Optional, and you can pick more than one.
- Anything ticked is always added to the plan, even if it falls outside the chosen food groups or above the chosen experience level. It's treated as a must-have.
- Picked items show up everywhere in the plan: seed quantities, bed advice, seasonal plan, week-by-week jobs and harvest dates. Flowers show as "flowering" instead of a harvest weight.
- Saved plans remember the choice. "Change my answers" refills it, and older plans still open as normal with nothing ticked.

## New crops
- **Pumpkin**: hungry feeder, about 1.5 m spacing, sown under cover in late April or outside in late May, harvested in autumn before frost.
- **Sweetcorn**: grown in blocks rather than rows so it pollinates, sown under cover in April or outside in late May, picked in late summer.
- **Flowers**: sunflowers, French marigolds and nasturtiums. They're easy, attract pollinators and help keep pests away. They're grouped as "Flowers".

## Technical details
- `src/lib/crops.ts`: add a `flower` category and label, plus 5 crop entries (pumpkin, sweetcorn, sunflower, marigold, nasturtium) with yieldPerPlantKg 0 for flowers.
- `src/lib/plan.ts`: add an optional `extras?: ("pumpkin"|"sweetcorn"|"flowers")[]` field to the plan input. Selection force-includes the mapped crop ids and bypasses the category and difficulty filters. Also add a minimum plant count (pumpkin 2, sweetcorn 9 in a block, 3–6 of each flower), capped so they fit the space. Harvest text for flowers reads "flowering".
- `src/routes/index.tsx`: add the chip question to the tastes step, store it in wizard state, and pass it through save and edit-load, defaulting to `[]`.
- `src/components/PlanView.tsx`: show a dash instead of kg for flowers.
- No database change, because answers are stored in the existing plan JSON.
