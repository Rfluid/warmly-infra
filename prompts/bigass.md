
You are a senior Frontend Engineer. Build a complete, production-grade frontend for **Warmly** on top of the existing backend in this repo. 
⚠️ Important constraints:

## Tech stack
- **Angular @latest or 17+** (standalone components, Angular Router, Signals; use RxJS where appropriate).
- **TailwindCSS** only for styling. Define a custom theme from the `warmly-ui` tokens/visuals.
- **TypeScript strict** on; ESLint + Prettier.

## Design system (derive from `/warmly-ui`)
Create a theme that faithfully mirrors the visuals from `warmly-ui`:

- **Brand gradient (background & accents):** orange → red-orange (from #FF7A59 to #FF4E3A). Use for hero, primary CTA, active nav highlights, and decorative strokes.
- **Light theme surfaces:** white (#FFFFFF) on off-white bg (#F8FAFC).
- **Text:** primary #0F172A, muted #334155.
- **States:** Success #22C55E, Warning #F59E0B, Danger #EF4444, borders #E2E8F0.
- **Radii:** large containers 24px; controls 12–14px. Overall “rounded, soft”.
- **Glass material:** backdrop blur 22–28px with 40–55% white overlay and 1px subtle hairline border; use on floating sidebar and blocking modals.
- **Shadows:** soft premium (y=10, blur=30, 12%); interactive elevation on hover/press.
- **Typography:** geometric sans (Inter/Manrope-like). Text styles: Display 48/56, H1 32/40, H2 24/32, Body 16/24, Caption 13/18.
- Expose as Tailwind tokens/utilities:
  - Colors (brand, surface, text, states)
  - Gradients: `bg-warmly-soft` (subtle background), `bg-warmly-hero` (full-strength)
  - Effects: `glass/24`, `shadow/card`, `shadow/fab`
  - Radius presets: `r/24`, `r/16`, `r/12`

## Layout & shell
- **Floating rounded sidebar** (glass), pill-shaped, docked with 24px inset so it looks detached. Collapsed width ~96px (icons), expanded ~288px (icon+label).
- **Topbar**: transparent over gradient, right-side status chips (e.g., “WhatsApp Connected”, “Persona Ready”), search, user menu.
- **Grid**: desktop 12 cols / 1440px frame reference, 24px gutters. Mobile-first responsive; Auto Layout principles in code (flex/grid) and fluid spacing scale (4/8/12/16/24/32/48).

## Routes, guards & global flow (frontend only)
- After successful auth (whatever the backend uses):
  1) If first login / no persona exists → **Persona Creation Wizard** route.
  2) If persona exists but WhatsApp is not connected → **WhatsApp Connection Gate** route and show a **non-dismissable blocking modal** with a QR code/status until connected.
  3) Once connected → main app.
- Implement guards for **persona presence** and **WhatsApp connection** that consult the backend/SDK without guessing undocumented fields.

## Pages & feature details
Implement these routes/components with the specified behavior and UI. Do not invent backend details; use the provided API/SDK:

1) **Auth / Login**
   - UI for two options: “Continue with Google” and “Email & Password”.
   - Use brand gradient on the hero side; minimal clean form cards.
   - Wire to the backend’s documented auth mechanisms (no assumptions).

2) **Persona Creation Wizard (first login)**
   - 7 steps with progress sidebar:
     - Identity (company, role of speaker, persona name, languages, pronoun/form of address)
     - Tone & Style (chips: friendly/consultative/direct/technical/premium; emojis level; regionalisms; favorite & banned phrases)
     - Company About (3–5 sentence summary, social proof, forbidden promises, compliance toggles)
     - Catalog & Pricing (file upload UI for PDF/CSV/XLSX; choose “main price table”; regional pricing rules; min order; negotiation policy; top-5 products; safety notes)
     - Conversation Playbook (opening message, top-5 diagnostic questions, allow image/audio flags, common objections with standard replies, deal triggers, required fields for handoff)
     - Automations (warmth threshold 0–100; follow-up rules by ranges/cadence; quiet hours; rate limit; opt-out keywords)
     - Final Notes & Name Suggestions (free text + “Suggest persona names” toggle)
   - On finish: call backend to persist persona + compiled system prompt/YAML as defined by the backend docs.

3) **WhatsApp Connection Gate**
   - Route to proper waha dashboard endpoint. You must ask for the dashboard password when creating the warmly stack and show the password and user (admin) so user can login to waha

4) **Main Shell**
   - Floating rounded sidebar (glass) with sections: **AI Manager**, **Conversations**, **Leads**, **Funnel**, **Broadcast**, **Settings**.
   - Show small status chips in the nav (connected, persona ready).

5) **AI Manager**
   - Cards:
     - Persona: view/edit the wizard data; show **Compiled Prompt** with a Copy button.
     - Knowledge & Files: upload/manage PDFs/CSVs/XLSX; mark “Main Price Table”. Files must be uploaded to rag via warmly AI endpoint.
     - Tools/Policies toggles (e.g., “no total calculations”, “ask for state before price when regional”, “no external links”) – only storing flags the backend supports.
   - Optimistic UI with toasts; fetch/save using documented API.

6) **Conversations**
   - Two-pane chat:
     - Left list: contacts with avatar/initials, last message excerpt, **Warmth** badge (0–100).
     - Right: chat thread (bubbles for lead vs AI), attachments (pdf/img/audio), template dropdown and quick-reply chips.
     - Header actions: “Create Deal”, “Open Lead”.
   - Real-time updates: subscribe to backend events (websocket/SSE) if provided; otherwise poll as documented.

7) **Leads (Table)**
   - Customizable columns; powerful filters (by tag values, Warmth range, last activity).
   - **Dynamic tag fields** (schema defined server-side): each tag has name, description, and type (`text` | `select` | `multiselect`) with options. Inline editing in row and in a side drawer.
   - Bulk actions: import CSV, bulk add/remove, bulk tagging, export CSV.
   - Side drawer: lead profile, timeline, editable tags.
   - The **AI** (backend-driven) may update tags during conversations; reflect live changes.

8) **Funnel (Kanban)**
   - Columns (configurable; default): Inactive • Active • Waiting Sales Contact • Won • Lost.
   - Drag & drop lead cards; persist status changes via backend.
   - Right insights rail: velocity, average warmth, alerts (if the backend exposes them).

9) **Broadcast / Automations**
   - Tabs: **Bulk Send** and **Automations**.
   - Bulk Send: message editor with variables (e.g., {{lead.name}}), audience builder (filters by tags, warmth range, inactivity), preview count and sample list. Show rate-limit notice (values read from backend).
   - Automations:
     - Rule by **Warmth Range** (e.g., 40–60) + **cadence** (every N days) + **template**.
     - Rule by **Inactivity** (no reply for N days) + template.
     - Drip sequences (scheduled steps).
   - History (runs, success/fail counts). Persist & fetch using backend contracts only.

## Component library (Angular + Tailwind)
Create reusable, responsive components that embody the `warmly-ui` look:

- Buttons (Primary gradient / Secondary outline / Ghost; L/M/S; states)
- Inputs (text, select, multiselect chips, textarea; focus/error/success)
- Badge/Chip (neutral/success/warning/danger) + **Warmth** chips (≤39 cool, 40–69 warm, ≥70 hot)
- Tag Pill (editable; types as above)
- Cards (base/elevated/glass)
- Modal (centered; large; **WhatsApp QR** variant)
- Sidebar Item (icon+label; active/hover; notification dot)
- Table (sticky toolbar; sortable; checkbox rows)
- Kanban Column + Lead Card (drag handle; warmth; next best product stub)
- Chat Bubbles (lead vs AI; attachments)
- Toast/Alerts; FAB for quick actions

## State, errors, and real-time
- Use Angular **Signals** for local UI state; services for data fetching. Keep side-effects in services.
- Surface errors with human-readable toasts; include inline field errors on forms. Never guess server payload shapes—use the actual types from the repo.

## Responsiveness, accessibility, performance
- Mobile-first. Breakpoints for ≤640, ≤768, ≤1024, ≥1440. Fluid typography via `clamp()`. Ensure the floating sidebar collapses gracefully (icons-only) and can turn into a bottom or top app bar on small screens.
- Keyboard navigable: focus rings on all interactive elements; ARIA labels where needed; avoid tabindex traps.
- Contrast ≥ 4.5:1 for body text on surfaces; check gradient overlays for legibility.
- Lazy-load routes; code-split feature modules; defer heavy assets; prefer virtual scroll for large lists.

## Environment & config (frontend only)
- Read a **BASE_URL** (or similar) from environment for API calls; no secrets hardcoded but include a default to localhost and proper port.
- If the backend exposes web sockets/SSE, make the URL configurable.

## Alguns requisitos técnicos para a UI:

1. A página de filtros por temperatura faz queries no big query com base na tabela manipulada pela stack warmly.
2. Podemos enviar mensagens por temperatura e agendar envios recorrentes de mensagens para determinadas faixas de temperaturas.

Voc~epode cirar um baackend alternativo em um subfolder se for necessário.


## Non-negotiables
- **Follow the visual language in `/warmly-ui` exactly**, but make it **fully responsive and accessible**.
