---
name: rapid-prototype-implement
description: Generate static RPML UI prototypes from product requirements, screenshots, existing UI code, or design notes. Each .rpml file is one screen or functional region (root `<page>`) that lays out every interaction state, permission variant, and loading/empty/error/validation branch in a single annotated layout; a multi-screen product becomes a set of such files, browsed together as a gallery. The result is a product definition engineering can build from and QA can test against. Use when the user wants to prototype, spec, or visualize one or more product screens, turn requirements or a design into a reviewable UI artifact, or document a page's states and edge cases, even if they don't explicitly say "RPML" or "prototype".
---

# RPUI Prototype Implementation Skill

Turn product requirements, screenshots, existing UI code, or design notes into a static **RPML** prototype. Each `.rpml` file is **one screen or functional region** — a single readable document that bakes every interaction state, permission variant, and loading/empty/error/validation branch into one spatial layout, at a depth engineering can implement from and QA can derive test cases from, without running the app. A multi-screen product is a **set** of these files (one per page/region), browsed together as a gallery via `serve`, the compiler, or the playground.

RPML does not simulate interaction; it replaces time with space. The two words that govern quality are **complex** (cover a real production page's information density) and **complete** (no state, branch, permission, or edge case left implicit). For the _why_, see `spec/00-overview.md`.

> If a reviewer finishes reading the prototype and still has to ask "but what happens when…", it is not done.

## Capabilities (generation-first)

| Capability              | Prompt                                                       | Use when                                                          |
| ----------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| **Generate** (flagship) | [`prompts/generate-rpml.md`](prompts/generate-rpml.md)       | Producing a new `.rpml` from requirements/screenshots/code        |
| Review                  | [`prompts/review-rpml.md`](prompts/review-rpml.md)           | Checking an existing `.rpml` for completeness                     |
| Diff impact             | [`prompts/rpml-diff-impact.md`](prompts/rpml-diff-impact.md) | Classifying what changed between two `.rpml` versions             |
| RPML → code             | [`prompts/rpml-to-code.md`](prompts/rpml-to-code.md)         | Extracting a spec from `.rpml` and generating implementation code |

## Generation best practices (non-negotiable)

These are short and load-bearing — follow them even before opening the references.

**Output contract (per file).** Each `.rpml` covers exactly one screen/region. Emit a bare `.rpml` file — root element `<page>`, **no HTML wrapper, no doctype**. The document holds:

1. one `<page>` with `title`, `route` (the screen's URL path), and a `description` naming the representative state the snapshot captures — **or** `<page title="..." mode="doc">` for linear reference documents (release notes, specs) with no canvas or route,
2. exactly one `<view device="desktop|tablet|mobile">` containing the main snapshot (usually inside a `<viewport device="…">`),
3. snapshot content built with **RPML primitives only**,
4. `data-pin="N"` on every meaningful region, numbered from 1 with no gaps,
5. a matching top-level `<annotation id="N" label="…">` for every pin (and a matching pin for every numbered annotation — strict 1:1),
6. `<annotation-global label="…">` for cross-cutting notes that don't belong to one region (permission matrix, glossary, global policy) — pin-less, rendered at the top of the pane,
7. `<enum>` / `<enum-item>` for every conditional branch and state family.

To preview, host the `.rpml` (playground `?rpml=`, `npx @21stware/rpui serve .`, or the compiler). Only as a secondary "embed in a page" option do you wrap it in HTML with a single `<script type="module" src="dist/rpui.js"></script>` — never the primary output.

**Pin↔annotation parity.** Every `data-pin="N"` has exactly one top-level `<annotation id="N">`, and every numbered `<annotation id="N">` has exactly one `data-pin="N"`. Pins are consecutive from 1. A numbered annotation with no pin is a defect — route genuinely cross-cutting notes to `<annotation-global>` instead.

**Overlay trigger pattern.** Overlays and transient feedback (`modal`, `drawer`, `dropdown`, `popover`, `tooltip`, `toast`) are interaction _results_, not page regions. Never place them in the main snapshot. Instead: pin the **trigger** (the button/row/menu entry that opens it), state the trigger condition + permission gate in the annotation body, and render the overlay **inside the annotation** as an `<enum>` of its variants.

```html
<!-- main snapshot: only the trigger is pinned -->
<button label="批量关闭" variant="danger" data-pin="5"></button>

<!-- annotation: trigger condition + overlay rendered here -->
<annotation id="5" label="批量关闭">
  触发条件：勾选 ≥1 行后点击「批量关闭」，仅主管/坐席可见。点击弹出二次确认。
  <enum>
    <enum-item label="确认弹窗" description="列出影响范围与可逆性。">
      <modal title="批量关闭确认" has-footer>
        <alert
          type="warning"
          title="将关闭 3 条工单"
          message="客户 7 天内可重开。"
        ></alert>
      </modal>
    </enum-item>
    <enum-item label="关闭成功" description="3s 自动消失，列表刷新。">
      <toast type="success" title="已关闭 3 条工单"></toast>
    </enum-item>
  </enum>
</annotation>
```

A side panel that is a _permanently docked_ structural region may appear open in the snapshot — but document its open/close trigger anyway. When unsure, treat it as an overlay.

**Forbidden.** No `div`/`button`/`input`/`table` for product UI (use RPML primitives; plain text in annotations is fine). No `onclick`, event attributes, timers, API calls, runtime focus, or hover behavior. No external CSS, image CDNs, or icon CDNs (the runtime ships inline SVG icons). No `position:absolute`/`fixed` in snapshot content — RPUI owns pin positioning.

**Bare tags.** Single-word elements have no suffix (`button`, `table`); compound names keep their hyphen (`list-item`, `table-row`); platform primitives use `ios-*`. Never write the underlying component tags (`page-el`, `main-view`).

## References (single sources of truth)

Depth lives in these — do not re-derive it:

- **Method** — IA-first design (purpose / priority / regions), update restructure rules, recursive decomposition L1–L5, coverage-matrix for combinatorial states, annotation-body dimensions, the what-NOT-to-do list: [`references/practise.md`](references/practise.md).
- **Composition** — when to use `list` vs `flex-layout`, overlay pairing, few-shot index (Patterns / Webapp / Gallery): [`references/composition-guide.md`](references/composition-guide.md). Read this before inventing page chrome.
- **Compressed spec** — root structure, attributes, rules at a glance: [`references/spec-summary.md`](references/spec-summary.md). Full language rules: `spec/`.
- **Component reference** — every element and its attributes: `llms.txt` (authoritative). One-line element index: [`references/element-index.md`](references/element-index.md).
- **Worked example (the complexity bar)** — a complete, implementation-depth prototype to study before authoring: [`references/example-reference.rpml`](references/example-reference.rpml) (a service desk: every region pinned and annotated, deep where the domain warrants, every overlay modeled as trigger → result, cross-cutting concerns in `<annotation-global>`). Match your depth to the domain — don't over-build a simple page to this level. More graduated examples (entry → complex) live in `examples/`.
- **Visual catalog** — `bun run dev` → `/preview/`: **Mobile → Patterns** (full-screen few-shots) and **Mobile → Mobile Widget Gallery** (per-widget iOS cards), **Webapp → Primitives Gallery** (desktop control fragments), **Webapp** product screens (desktop IA). The two galleries are distilled into inline shots in `prompts/generate-rpml.md` (§ Widget composition shots). Do not paste the entire gallery HTML into the model context; pick one few-shot + composition-guide.

## Workflow

1. Gather inputs (requirement → screenshot → conditional code → permission matrix → async states → existing product/page IA). Make every inferred state explicit in an annotation.
2. **Design information architecture first (gate)** — product nav/screen inventory when relevant; always page purpose, priority stack (P0/P1/P2), and region map (chrome / primary / secondary / tertiary / transient). Do **not** invent columns, cards, or tabs until this is fixed. See `references/practise.md` §1b.
3. Pick the device preset (`desktop` desktop/admin, `tablet`, `mobile`) — prefer fixed-width, auto-height.
4. Choose the **most information-dense representative state** for the snapshot that still respects the IA priority stack: loaded data, active selection, an open docked panel, role-specific controls, active validation. Never an empty shell.
5. Build the snapshot inside `<view>` with RPML primitives so layout **expresses** the region map; add `data-pin="N"` in scan/importance order.
6. Create one top-level `<annotation id="N">` per pin (labels = region roles).
7. Apply recursive decomposition (L1→L5) and the coverage-matrix method to each region — see `references/practise.md`.
8. Write annotation bodies at implementation depth (include IA role); expand every hidden interaction result into an `<enum>`.
9. On **updates**: re-evaluate IA with the new requirement; restructure / re-home / renumber rather than pure append (`practise.md` §1b.5).
10. Verify no forbidden patterns (HTML product UI, JS, external resources, absolute positioning).
11. **Validate:** `bun run validate <file.rpml>` — fix every reported error before delivering; re-check the IA checklist yourself.

**Multi-screen products.** A prototype is rarely one file. Produce **one `.rpml` per screen or functional region**, named by route, and collect them in a directory the gallery can host (`serve`, the compiler, or playground folder-drop). Never cram multiple screens into one `<page>` — the one-`<view>` contract forbids it. The split signal is conceptual, not numeric: if a `<view>` is covering more than one screen or route, split it into separate files. Link the resulting screens with `<anchor to="other.rpml" section="N">` and state the entry/exit routes in each `description` so the set reads as one connected flow.

## Quality bar

Before finishing, confirm:

- **IA was designed before layout**; a reviewer can restate the primary job and region hierarchy from the snapshot + pins alone,
- pin numbers continuous and roughly follow importance/scan order; every pin has a matching top-level annotation,
- the snapshot shows the most information-dense useful state **without violating the priority stack**,
- updates restructured hierarchy when needed (no pure accretion / dual primaries / dump regions),
- decomposition reached implementation depth where the domain warranted it (state machines, permission gates, validation, boundaries covered),
- combinatorial states (permission × state, role × scale, step × validation) enumerated, not collapsed,
- every hidden interaction result expanded into an enum; overlays modeled as trigger → result,
- role/permission differences explicit,
- runtime limits noted where they affect fidelity (e.g. `table` cell text is sampled from column names — describe exact data in the annotation),
- no forbidden product-UI HTML, scripts, event handlers, or external resources.
