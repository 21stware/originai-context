# RPML Generation Practices

The single reference for _how_ to decompose a page into a complete RPML prototype. `SKILL.md` routes here for method depth; the runnable system prompt is `prompts/generate-rpml.md`.

**Governing order (non-negotiable):**

```text
inputs → information architecture (IA) → visual weight (sentence + bands + contrast) → representative state → layout chrome → content & states
```

Never invent layout or fill controls before the IA of the screen (or product) is explicit. Layout is how IA is expressed, not a substitute for it. Visual rank is how that IA is *seen* — decide it before picking cards, type sizes, or buttons.

## 1. Inputs to gather before generating

Collect in priority order:

1. **Product requirement / user story** — the feature, route, and user goal.
2. **Screenshot or design draft** — identifies regions, layout, and density.
3. **Existing code with conditionals** — read every `v-if`, `&&`, ternary, and guard; each is a state to enumerate.
4. **Permission matrix / role notes** — which roles exist and what differs per role.
5. **Known async states** — loading, empty, error, retry, partial-failure, timeout.
6. **Existing IA in this project** — README route map, sibling screens, shared chrome (sidebar/tabs), and the current page's region map if editing.

If any input is missing, infer common SaaS/product states and make every assumption explicit in an annotation. Never silently omit a plausible state.

## 1b. Information architecture first (before any layout)

IA answers: **what must the user understand and do here, in what order of importance, and how is that hierarchy expressed as regions?**  
Layout answers: **which RPML primitives and columns implement that hierarchy.**  
Content answers: **what labels, values, and states fill those regions.**

If you skip IA, you get pretty but incoherent screens: equal-weight cards, random side panels, tabs that don't match jobs-to-be-done, and incremental edits that bolt features onto the wrong place.

### 1b.1 What "IA" means at two scales

| Scale | Design object | Must decide before markup |
| ----- | ------------- | ------------------------- |
| **Product / set** | Screen inventory + nav model | Which screens exist, entry routes, primary nav (sidebar / tabs / stack), what each screen owns vs. shares |
| **Single page** | Region hierarchy | Primary job of this view, ordered regions (primary → secondary → tertiary), what is chrome vs. content, what is always visible vs. progressive disclosure |

Product-level IA usually lives in `README.rpml` (route map, modules, flows). Page-level IA is decided **every time** you generate or materially update a screen — even when the README already exists.

### 1b.2 Page IA model (required mental model)

Before writing `<view>` content, lock these five layers:

1. **Purpose** — one sentence: the user's primary job on this screen (e.g. "triage open tickets and open one for action").
2. **Priority stack** — ordered list of information/actions by importance (P0 must be visible without scroll on the main canvas; P1 visible in the default state; P2 progressive / secondary / overlay).
3. **Region map** — named structural areas and their roles, not widgets. Example:
   - Chrome: app nav / page header / contextual toolbar  
   - Primary: main work surface (list, canvas, feed, form)  
   - Secondary: filters, inspectors, summaries that support the primary job  
   - Tertiary: metadata, audit, help, overflow  
   - Transient: overlays triggered from regions (not co-equal regions)
4. **Grouping & sequencing** — what is scanned first (F/Z patterns, reading order), what is grouped together because it is one decision, what must not compete for attention.
5. **Disclosure model** — always-on vs. collapsed vs. docked vs. modal; which states change the hierarchy (empty vs. loaded vs. selection-active).

**Anti-pattern:** jumping from a feature request to "add a card / column / tab" without re-ranking the priority stack. New content must earn a place in the hierarchy or force a deliberate restructure of it.

### 1b.3 How IA shows up in RPML (so it actually shapes output)

IA is not a private thought — encode it so layout and annotations cannot drift:

| IA decision | Where it appears in the `.rpml` |
| ----------- | ------------------------------- |
| Page IA (retrieval, not RPML) | Sibling `ia-text` record (`text/plain`) — purpose, priority, regions, grouping. Gallery dock only. **Never** `<ia>` tags |
| Grouping / disclosure rules | Same `ia-text` Do / Don't — scan order, sectioning, chrome vs primary. **Not** primitive recipes (`list` vs `flex`, `ios-tabbar`) |
| Screen purpose + representative hierarchy | `<page description="…">` — name the job and the hierarchy emphasis, not only the data state |
| Cross-page nav model | README route map + each screen's chrome (sidebar active item / tabbar active / breadcrumb) |
| Region map | `data-pin` order follows **importance / reading order**, not arbitrary paint order; L1 annotation labels match region roles ("Primary list", "Context inspector") |
| Priority (P0/P1/P2) | Snapshot composition: P0 fills the dominant surface; P1 sits adjacent; P2 in overflow, accordion, or annotation-only |
| Shared chrome vs. page body | `app-shell` / `navigator` / `ios-tabbar` for shared; body for page-owned content — never reinvent nav per file without reason |
| Hierarchy change under selection / filter / role | Documented in annotation bodies + `<enum>`; snapshot shows the **selected hierarchy** if that is the densest real use |

Pin numbers should roughly track scan order (1 = most critical region users must understand first). That makes the annotation pane read as a guided IA walkthrough, not a random inventory.

### 1b.4 IA checklist (pass before building markup)

- [ ] I can state the page's primary job in one sentence.
- [ ] I have an ordered priority stack (P0/P1/P2) for information and actions.
- [ ] Every major region has a role (chrome / primary / secondary / tertiary / transient).
- [ ] Shared product chrome matches sibling screens (same nav model and active state).
- [ ] Nothing of equal visual weight competes with the primary job without a reason.
- [ ] Overlays are not treated as permanent peers of the primary region.
- [ ] Visual-weight gate (§1c) is locked: sentence, bands, one protagonist, one action, contrast budget.
- [ ] If this is an **update**, I have decided whether the change **extends**, **reorders**, or **restructures** the existing IA (see §1b.5).

### 1b.5 Updates: restructure IA — do not only append

Edits that add capability almost always change hierarchy. **Default is wrong:** "find a gap and insert another block." **Default should be:** re-evaluate the page IA with the new requirement as a first-class input, then choose the smallest structural move that preserves a clear hierarchy.

| Change type | IA response | Typical RPML action |
| ----------- | ----------- | ------------------- |
| **Reinforces existing P0** | Keep region map; deepen primary region | Edit primary pin/annotation; add enums |
| **Promotes a secondary concern to frequent use** | Re-rank priority stack; may swap primary/secondary surfaces | Move content between regions; retitle pins; renumber if scan order changes |
| **New job that doesn't fit any region** | Add a region **or** split a new screen — decide by whether the job shares context with this route | New L1 pin **or** new `.rpml` + anchors; update README routes |
| **Cross-cutting policy / permission** | Not a new visual peer | `<annotation-global>` or shared chrome change across files |
| **Deprecates old primary** | Demote or remove; do not leave zombie equal-weight UI | Remove/repurpose pins; rewrite description; fix active nav |
| **Density overflow** | Progressive disclosure or split screen — never endless equal cards | Collapse to filters/tabs/inspector; or split file |

**Hard rules for updates:**

1. **Read the current page (and README) first** — reconstruct the existing region map and priority stack before editing.
2. **Name the IA delta** in your reasoning (and briefly in `description` or a global note when the hierarchy changed): what was P0 before, what is P0 after.
3. **Prefer re-homing over stacking** — if a new filter, metric, or action is added, place it where the hierarchy says it belongs; do not append a fifth equal card under four existing ones.
4. **Renumber pins when scan order changes** — pin order is part of the IA narrative.
5. **Keep sibling screens consistent** — if nav, IA module boundaries, or shared chrome change, update related files in the same pass when the user is editing the product set.
6. **Reject pure accretion** when it creates two primaries, duplicate entry points, or a "misc" dumping ground region.

Worked intuition: user asks to "add AI summary to the ticket list."  
- Bad: another full-width card above the list (steals P0, breaks triage job).  
- Better IA: summary as **selection-dependent secondary** in an inspector, or a one-line insight in the list toolbar, with full summary in annotation enums — primary remains the list.

## 1c. Visual expression of IA (mandatory gate, before markup)

IA ranks **meaning**. Visual expression ranks **attention**. A correct P0/P1/P2 stack rendered as equal cards, equal type, and two primary buttons is a failed encoding — the snapshot does not say what the IA decided.

This is **not** a skin pass and **not** CSS. RPML styling is semantic (`variant`, `size`, `gap`, `elevation`, `pane` vs `panel`). Do **not** invent `style=`, palettes, or decorative gradients. Do encode weight with the primitives the runtime already has. Motion, light, and material that RPML cannot paint belong in annotation **Visual intent**, not in fake chrome.

### 1c.1 Three weights — never collapse them

| Weight | Question | Typical trap |
| ------ | -------- | ------------ |
| **Business** | Must this exist (price, legal, CTA, permission)? | Legal / helper copy set at title size |
| **Cognitive (must-see)** | What must the user grasp in one second? | Hiding P0 to show a flashy P1 |
| **Visual** | How much attention may this consume? | Making everything large, filled, or `primary` |

**Mapping rule:** business-high does **not** imply visual-high. Disclaimers, timestamps, membership notes, and field hints must exist (must-have) and stay **quiet**. The protagonist (must-see) owns area and isolation. The primary action owns **contrast**, not acreage — a small `variant="primary"` button beats a huge ghost block.

### 1c.2 Gate (lock with §1b.2, before any `<view>` body)

1. **Visual sentence** — one sentence the screen must communicate. Example: "This is the waiting queue; open a ticket and reply." If a region does not serve the sentence, demote or delete it.
2. **Must-see vs must-have** — must-see gets visual rank; must-have may be muted, smaller, tertiary, or annotation-only.
3. **One protagonist + one action** — one region owns the canvas; the snapshot contains **exactly one** `button variant="primary"` (or one filled `ios-button`) for the page job. All other actions are `secondary` / `ghost` / `link`. Danger is reserved for destructive jobs.
4. **Three bands and their order** — Identity (what is this) · Proof (why trust / what to inspect) · Action (what next). Order is a product choice, not a default stack:
   - **Tool / triage / admin:** Identity → Proof → Action (name the queue, then the work, then act).
   - **Commerce / marketing exhibit:** Proof → Identity → Action (hero first, name and terms after).
   - **Auth / checkout / system:** Identity → Action, with Proof as quiet trust copy.
5. **Alignment lock** — one system per screen. Scan/compare = start (left). Brand/ceremony = center. Efficiency/data = grid. Do not mix centered titles with a split footer, or left-aligned tools with a ceremonial hero, unless the bands are deliberately different surfaces.
6. **Contrast budget — three ranks only:**

| Rank | Use for | RPML levers |
| ---- | ------- | ----------- |
| **Hero** | Protagonist surface | Dominant area (`flex="1"`, wide column, large `image-placeholder`, primary `list`/`table`); isolation via a **larger** `gap`/`spacer` around it |
| **Emphasis** | Title, key value, the one action | `heading` level 1–3; `text weight="semibold"`; **one** `button variant="primary"` |
| **Quiet** | Meta, legal, timestamps, secondary nav, helper | `text size="sm\|xs" variant="muted"`; `heading level="6"`; `button variant="ghost\|secondary"` |

Spending the hero rank twice (huge title **and** huge image on a compact transactional tile; four equal `stat-card`s as the page) is a hard fail.

### 1c.3 Distribution — how weight is placed

Visual weight ≈ **position × area × contrast × isolation**. Raise one factor; do not raise all four on every element.

- **Position** — first in scan order (top, pin 1) is heavier. Pin order must still match this.
- **Area** — the work / proof surface is the largest region. The CTA may be small.
- **Contrast** — `variant="primary"`, `highlight` on the selected row, and `tag` color outrank extra `heading` size. Brand color is punctuation, not fill — do not set `color="primary"` on headings "for emphasis".
- **Isolation** — spacing **groups**. Tight `gap` (4–8) inside one decision; `12–16` inside a band; `24–32` when the band changes. Prefer the scale `4 8 12 16 24 32` — do not invent 13 / 17 / 22.

**Band → structure (common mappings):**

| Intent | Prefer |
| ------ | ------ |
| Identity in a tool | `navigator` / `ios-navbar` title + muted meta — not a hero `card` |
| Proof as work | `list` / `table` as the primary region; selected row `highlight` |
| Proof as exhibit | Large `image-placeholder` (or hero media) **above** copy |
| Action as checkout | Footer `flex-layout justify="between"`: quiet price/meta start, one primary end |
| Action as ritual | Centered primary under stacked, centered copy |
| Grouping without competing | `pane` (no border / fill / radius) |
| One lifted container | `panel elevation="1"` or `card` — not on every block |
| Floating result | `elevation="2"` only on that overlay/surface |

A reviewer who greys out color should still see: one big region, one emphasized action, quiet meta. If they cannot, distribution failed.

### 1c.4 Surface means — each has one job

Do not stack border + elevation + `bg="muted"` + `highlight` + `bordered` on the same block.

| Surface | Job | Snapshot lever | Do not |
| ------- | --- | -------------- | ------ |
| **Spacing** | Group decisions | `gap`, `spacer`, `padding` / `px` / `py` | Equal gaps everywhere; spacer as decoration |
| **Background** | Stage vs content | Rails / section headers `bg="muted"`; work surface stays default | Painting the P0 surface `muted` so it recedes |
| **Chrome / border** | Define a container only when contrast is missing | `panel` / `card` / `bordered` **or** a sibling `divider` | Panel-in-panel; hairline on every group |
| **Elevation** | Altitude | Default or `1` for a card; `2` only if it must float above the page | Elevation on every region |
| **Type** | Rank | `heading` level + `text` size / weight / `variant` / `align` | Title, price, legal, and CTA at the same size |
| **Color** | Punctuation | One primary button; `tag color` for status; `color="danger"` for errors | Extra primary-colored headings; colored panels |
| **Motion / gradient / material** | Explain a state change, or light — never snapshot CSS | Annotation **Visual intent** (see below) | `style=`; fake gradient panels; animating titles |

**Annotation-only surface** (RPML cannot render these; still specify when they affect implementation):

- **Motion** — only when state changes (press, overlay enter/exit, list replace). Name the trigger and a duration class: press ~120ms, hover/small ~200ms, overlay ~200–320ms, entrance ~320–480ms. No motion on titles, legal copy, or keyboard-repeat actions.
- **Gradient** — light on a hero or CTA, never a second brand wash across the page.
- **Material** — pick one for the product and keep sibling screens on it: retail-flat (quiet cards, one filled CTA), tool-dense (flat, hairlines, compact), or system-translucent (platform chrome on mobile). Mixing two materials on one route looks like a template collage.

### 1c.5 Encode in the artifact

| Decision | Where it appears |
| -------- | ---------------- |
| Visual sentence + band order | `page description` — job **and** what the snapshot privileges ("Waiting queue; list is P0, inspector is P1, Reply is the action") |
| Protagonist | Dominant surface + pin 1 (or the pin on that surface); L1 label names the role, not the widget |
| Action | Exactly one `variant="primary"` (or one filled `ios-button`) in the main snapshot |
| Quiet must-haves | `muted` / smaller type / tertiary region / annotation enum — **present**, not loud |
| Motion, gradient, material | L1/L2 annotation body, **Visual intent** — one or two sentences, never CSS |
| Product material | README design notes + the same chrome language on sibling screens |

### 1c.6 Checklist (pass with §1b.4 before markup)

- [ ] Visual sentence is one job.
- [ ] One protagonist region; one primary action in the snapshot.
- [ ] Band order (Identity / Proof / Action) is chosen and visible.
- [ ] Alignment is one system.
- [ ] Contrast budget is three ranks; must-haves that must not compete are quiet.
- [ ] Spacing groups decisions; band changes use a larger gap.
- [ ] At most one elevation language; `pane` where chrome would compete.
- [ ] No `style=`. No extra `color="primary"` on text. No equal-weight card wall.
- [ ] Implementation motion / material, if any, lives in annotations.

### 1c.7 Hard fail

- Two or more `variant="primary"` in the main snapshot without a mutually exclusive `<enum>` reason.
- Four equal `stat-card` / `card` tiles as the page (no protagonist).
- Title, price, disclaimer, and CTA at the same `text` size / weight.
- `panel elevation="2"` (or bordered + muted + highlight) on every region.
- Hero media **and** a display-size title both claiming first place on a compact transactional tile.
- "Visual polish" as extra badges, extra buttons, or extra color instead of re-ranking.

## 2. Recursive decomposition (L1–L5)

Apply this top-down to every pinned region **after** the page IA region map is fixed. L1 pins should map 1:1 onto IA regions (chrome / primary / secondary…), not onto random widgets. Stop nesting when further splitting adds no implementation value.

| Level | Element                                      | Purpose                                                                                        |
| ----- | -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| L1    | `<annotation id="N">` (pinned)               | Structural area of the page: navbar, sidebar, filter bar, table, drawer                        |
| L2    | Nested `<annotation>`                        | Distinct responsibility inside the region: one column, a form field group, the bulk-action bar |
| L3    | `<enum>` or nested annotation containing one | Mutually exclusive states for that element: default/focus/filled/error; collapsed/expanded     |
| L4    | `<enum-item>` + `description`                | What each state means: trigger, threshold, transition, permission gate                         |
| L5    | Deepest annotation/enum                      | Extremes and failure modes: 0/empty/overflow values, race conditions, permission denials       |

A simple stat card may stop at L3. A data table with a detail drawer routinely reaches L5. Let the domain decide depth; let completeness decide breadth. **IA decides which L1 regions exist; decomposition decides how deep each goes.**

## 3. Coverage-matrix method

Completeness in complex apps is combinatorial, not a flat list. When two or more axes interact, enumerate the **product**, not each axis alone:

- **permission × state** — detail-drawer buttons differ by role _and_ by ticket status.
- **role × data-size** — admin view of 5000 rows vs agent view of 7 rows.
- **flow-step × validation** — each wizard step × (valid / invalid / pending).
- **read-state × SLA × selection** — a table row's appearance is the product of all three.

Build the matrix mentally, drop impossible cells, and create one `<enum-item>` per surviving combination. If a cell is intentionally out of scope, say so in an annotation rather than leaving it blank.

## 4. Annotation body structure

L1/L2 bodies must read like a spec, not a caption. For a non-trivial region, cover the relevant subset in plain prose — one or two precise sentences each:

- **IA role** — primary / secondary / chrome / transient; why this region exists for the page job.
- **Visual intent** — protagonist / emphasis / quiet; band (Identity / Proof / Action); alignment; and any motion, light, or material that RPML cannot paint. One or two sentences — not CSS.
- **Trigger / entry condition** — what causes this to appear or activate.
- **Data source & refresh** — where values come from, polling/refresh cadence.
- **State enumeration** — which states exist (then expand them in `<enum>`).
- **Permission gate** — which roles see/use it, what changes per role.
- **Validation rule** — required fields, formats, cross-field constraints.
- **Error / async handling** — loading, empty, partial-failure, retry behavior.
- **Boundary values** — limits, overflow, truncation, zero/critical states.

"Compact" means no padding — it does **not** mean omitting a dimension that matters. Completeness wins over brevity; precision wins over length.

### 4.1 Cross-cutting concerns → `<annotation-global>`

Some notes don't belong to any single pinned region: a role/permission matrix that spans the whole page, a global empty/error/loading policy, a glossary of domain terms, page-wide conventions, **or the page-level IA summary** (purpose + priority stack) when it helps implementers. **Do not** invent a numbered annotation for these — a numbered annotation must always have a matching pin. Put them in `<annotation-global label="…">`, which is pin-less by design and renders at the top of the annotation pane (the "0th" annotation):

```html
<annotation-global label="角色权限矩阵">
  三类角色能力差异，供研发实现 RBAC、QA 设计权限用例。
  <enum>
    <enum-item label="管理员" description="全量读写"></enum-item>
    <enum-item label="成员" description="读写本人"></enum-item>
    <enum-item label="只读" description="仅查看与导出"></enum-item>
  </enum>
</annotation-global>
```

### 4.2 Cross-page links and diagrams

- **`<anchor to="other.rpml" section="N" label="…">`** — explicit jump control in annotation bodies / flow notes; `section` deep-links a target annotation.
- **`link="other.rpml"`** (+ optional `link-section`) on snapshot elements — marks the real UI control as a cross-page jump (chip + ⌘/Ctrl+click in workbench). **Required** when the annotation describes navigation: never prose-only "goes to X".
- **`<diagram>`** — render a Mermaid flow / state / sequence / ER diagram inside an annotation (or in a `mode="doc"` README) to specify a state machine or flow precisely. Put the diagram header (`flowchart LR`, `stateDiagram-v2`, …) on its own line. README process flows default to **LR** and render at 1:1 (not scaled to the prose column). For product-level IA, a site-map or nav diagram in README is preferred over inventing ad-hoc nav on every screen.

## 5. Quality bar

A prototype meets the bar when a reviewer reading it has no remaining "but what happens when…" questions — **and** can restate the page's primary job, region hierarchy, and visual sentence without guessing.

Concrete targets:

- **IA before layout.** Purpose, priority stack, and region map were decided before markup; the snapshot visibly expresses that hierarchy.
- **Visual weight before chrome.** Visual sentence, band order, alignment, and contrast budget were decided with IA; the snapshot has one protagonist and one primary action; quiet must-haves stay muted. See §1c.
- **One annotation per pinned region — no target count.** Pin and annotate every meaningful region the page actually has. A dense admin page has many; a simple form has few. Never pad to a number, never drop a real region to stay under one. _Completeness decides breadth; the page decides the count._
- **Depth follows complexity.** Nest as deep as the region warrants — a stat card stays shallow, a data table with a detail drawer goes deep. Don't force uniform depth.
- **Strict pin↔annotation parity.** Every `data-pin="N"` ↔ exactly one numbered `<annotation id="N">`, both directions. A numbered annotation with no pin is a defect. Cross-cutting notes go in `<annotation-global>` (see §4.1), not an orphan numbered annotation.
- **Every conditional branch** in `<enum>` — states, permission variants, validation outcomes, async results.
- **Implementation-depth annotation bodies**: IA role, trigger conditions, data source, state-machine transitions, permission gates, validation rules, error handling, boundary values.
- **Updates restructure when needed.** No pure accretion that creates dual primaries or orphan dump regions.

Reference: [`example-reference.rpml`](example-reference.rpml) (bundled with this skill) — implementation-level bodies, every overlay modeled as trigger → result, with cross-cutting concerns in `<annotation-global>`. Study it before authoring; it is the complexity bar.

## 6. What NOT to do

- Do not use `div`, `button`, `input`, or `table` for product UI. Use RPML primitives only.
- Do not add `onclick`, hover behavior, runtime focus, timers, API calls, or framework state.
- Do not import external CSS, image CDNs, or icon CDNs. The runtime provides inline SVG icons.
- Do not use `position:absolute` or `position:fixed` in snapshot content. RPUI owns pin positioning.
- Do not place overlays (`modal`, `drawer`, `dropdown`, `popover`, `tooltip`, `toast`) in the main snapshot. Pin the trigger; render the overlay inside its annotation enum.
- Do not stack mutually exclusive states (empty + loading + modal) side by side in the snapshot.
- Use bare RPML tags. Single-word elements have no suffix (`button`, `table`); compound names keep their hyphen (`list-item`, `table-row`); platform primitives use `ios-*`.
- Do not omit a plausible state because the input didn't mention it; infer and annotate.
- **Do not lay out before IA** — no columns, cards, or tabs until purpose, priority stack, and region map are fixed.
- **Do not style before visual weight** — no equal-gap card walls, extra `primary` buttons, or elevation-on-everything instead of ranking attention. See §1c.7.
- **Do not write `style=`** or invent palettes / gradients in markup. Surface that RPML cannot paint goes in **Visual intent**, not CSS.
- **Do not update by pure append** — re-rank hierarchy; restructure regions when new content changes the primary job.
- **Do not create two visual primaries** or a catch-all "other" region to avoid IA decisions.

## 7. Validation

Run the validator after generating:

```
bun run validate <file.rpml>
```

The validator checks:

- Every `data-pin="N"` has a matching top-level `<annotation id="N">`.
- Pin numbers are continuous from 1 with no gaps.
- Structural constraints (page root, exactly one view, etc.).

Fix all reported errors before delivering the file. After structural validation, re-check the IA checklist in §1b.4 and the visual-weight checklist in §1c.6 yourself — the machine validator does not know your hierarchy or contrast budget.
