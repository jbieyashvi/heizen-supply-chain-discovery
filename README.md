# Heizen · Supply Chain Discovery Tool (Prototype)

A high-fidelity, front-end-only prototype of Heizen's internal Supply Chain
Discovery workspace. Built with realistic mock data to demonstrate product
thinking, prioritization, and believable interactions — no backend.

**Design principle:** _Show what matters now; reveal supporting evidence when needed._

## Stack

- **Vite** + **React 18** + **TypeScript**
- **react-router-dom** for routing
- **lucide-react** for line icons (no AI-sparkle iconography)
- Hand-authored CSS design system (`src/styles/global.css`, `src/styles/components.css`) —
  deep-charcoal enterprise theme, desaturated mint/teal accent, amber for
  stale/warning, red for critical, green for ready/confirmed.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`, or the next free
port). The app redirects `/` → `/projects`.

> Node isn't on the default PATH in this environment. A portable Node 22 lives at
> `~/.local/node-v22.14.0-darwin-arm64/bin`. Prefix commands with:
> `export PATH="$HOME/.local/node-v22.14.0-darwin-arm64/bin:$PATH"`

## What's built (this phase)

Two connected screens, per scope:

1. **Projects Command Centre** — `/projects`
   - Consultant work queue: summary strip, search, six filters, four sorts.
   - Structured project rows with readiness, research freshness, critical
     questions, opportunities, last activity, and a prominent recommended next
     action. Five realistic projects in distinct states.
   - **New project** side panel with progressive disclosure and a searchable
     currency selector.
2. **Project Overview** — `/projects/clio-snacks`
   - Header with project switcher + overflow menu, attention banner, call-readiness
     sequence, top insights (expandable, evidence-labelled), critical questions,
     opportunities preview, recent activity, and a prominent next-action card.

Other project sections (Research, Discovery, Opportunities, Process Map, Sources)
exist as **placeholder routes** so navigation stays intact.

## Routes

| Route | Screen |
| --- | --- |
| `/projects` | Projects Command Centre |
| `/projects/:id` | Project Overview (fully built for `clio-snacks`) |
| `/projects/:id/{research,discovery,opportunities,process-map,sources}` | Placeholder |

## Project structure

```
src/
  components/   reusable UI (AppShell, Sidebar, badges, ProjectItem, panels, …)
  pages/        ProjectsPage, ProjectOverviewPage, PlaceholderPage
  data/         types.ts, mock.ts (all realistic content lives here)
  lib/          status.ts (status → label/tone/tooltip maps)
  hooks/        useClickOutside
  styles/       global.css (tokens/primitives), components.css (layout/components)
```

All narrative content is realistic supply-chain copy — no lorem ipsum, no vague
AI marketing language.
