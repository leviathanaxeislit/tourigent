# AGENTS.md — Development Guidelines for AI Assistants

## Project Overview
"Vintage Paper Guidebook" is a travel itinerary web application.
- **Backend:** Python 3.11+, FastAPI, LangGraph, Gemini 2.5/3 Flash (with Search Grounding), Qdrant Async Client.
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Shadcn UI (`components.json`), Framer Motion, react-pageflip.

---

## Strict Development Rules

### 1. UI Component Strategy (Shadcn First)
- **Zero Raw HTML Controls:** All UI primitives (buttons, inputs, cards, dialogs, badges, popovers, accordions, sliders, tabs) MUST use Shadcn UI components located in `@/components/ui/`.
- **Registry Integration:** When a missing component is needed, query or invoke the Shadcn CLI (`npx shadcn@latest add <component>`) rather than creating custom HTML/CSS controls.
- **Skeuomorphic Layering:** Paper textures (`.bg-paper-texture`), rubber stamps (`.stamp-badge`), and handwritten margin notes (`.margin-note`) must be applied via Tailwind utilities and CSS variables *over* Shadcn primitives. Do not break Shadcn accessibility or ARIA attributes.

### 2. Backend Architecture (FastAPI + Qdrant)
- **Async Only:** All Qdrant vector operations (`qdrant_client.AsyncQdrantClient`) and FastAPI endpoints MUST be non-blocking (`async def`).
- **Pydantic Validation:** All API responses must strictly conform to Pydantic v2 models in `app/schemas/guidebook.py`. Never return unvalidated dictionary outputs.
- **Gemini Search Grounding:** Always enforce native Search Grounding on Gemini Flash calls to guarantee up-to-date venue details, real prices, and accurate geo-coordinates.

---

## Mandatory Skills & Communication Rules

### Required Skills
Always reference and apply these installed skills:
1. **Caveman (`.agents/skills/caveman/SKILL.md`)**: Communication style. Ultra-compressed responses, zero fluff, maximum token efficiency while keeping full technical accuracy.
2. **Shadcn (`.agents/skills/shadcn/SKILL.md`)**: UI component strategy & registry management.
3. **High-End Visual Design (`.agents/skills/high-end-visual-design/SKILL.md`)**: Agency-level visual polish, typography, paper textures, elevation, and design rules.
4. **Frontend Design (`.agents/skills/frontend-design/SKILL.md`)**: Distinctive, intentional layout and aesthetic direction.
5. **Gemini API Dev (`.agents/skills/gemini-api-dev/SKILL.md`)**: Modern Gemini SDK usage (`google-genai` / `@google/genai`), model selection (`gemini-3.6-flash`, `gemini-2.5-flash`), structured outputs, and search grounding.

### Communication Policy
- **Caveman Mode Active**: All responses MUST use compressed caveman style (`full` level).
- Drop articles, filler, pleasantries, tool narration, decorative tables.
- Keep technical terms, code, filenames, and exact commands verbatim.
- Minimize token consumption across all interactions.