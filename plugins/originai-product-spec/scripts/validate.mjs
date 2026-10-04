#!/usr/bin/env node

// src/validate.ts
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve, sep } from "node:path";

// ../rpml-parser/src/vocabulary.ts
var PRIMITIVES = [
  "viewport",
  "document",
  "layout",
  "panel",
  "pane",
  "ui-group",
  "section",
  "row",
  "col",
  "sidebar",
  "logo",
  "split-pane",
  "divider",
  "spacer",
  "app-shell",
  "toolbar",
  "flex-layout",
  "heading",
  "text",
  "search",
  "input",
  "textarea",
  "select",
  "button",
  "button-group",
  "checkbox",
  "checkbox-group",
  "radio",
  "radio-group",
  "toggle",
  "password-input",
  "tag-input",
  "form",
  "form-item",
  "date-picker",
  "upload",
  "image-placeholder",
  "progress",
  "slider",
  "range",
  "number-input",
  "rating",
  "pin-input",
  "color-swatch",
  "autocomplete",
  "badge",
  "avatar",
  "list",
  "list-item",
  "text-block",
  "status-dot",
  "tabs",
  "tab",
  "pagination",
  "steps",
  "breadcrumb",
  "breadcrumb-item",
  "segmented",
  "segmented-item",
  "command-palette",
  "context-menu",
  "menu",
  "menu-item",
  "nav-item",
  "filter-bar",
  "toc",
  "kbd",
  "anchor",
  "diagram",
  "table",
  "table-row",
  "table-list-row",
  "bulk-action-bar",
  "empty",
  "loading",
  "alert",
  "toast",
  "toast-stack",
  "dropdown",
  "popover",
  "tooltip",
  "modal",
  "drawer",
  "overlay-stage",
  "sheet",
  "card",
  "stat-card",
  "plan-card",
  "tag",
  "chip",
  "tree",
  "tree-item",
  "timeline",
  "timeline-item",
  "calendar",
  "kanban",
  "kanban-column",
  "kanban-card",
  "code-block",
  "diff",
  "image-grid",
  "map-placeholder",
  "media-placeholder",
  "key-value",
  "kv-row",
  "accordion",
  "accordion-item",
  "banner",
  "skeleton",
  "countdown",
  "result",
  "permission-gate",
  "quota-bar",
  "api-key",
  "audit-row",
  "workflow-node",
  "chart",
  "avatar-group",
  "comment",
  "file-list",
  "file-item",
  "ios-navbar",
  "ios-nav-action",
  "ios-tabbar",
  "ios-tab",
  "ios-list",
  "ios-list-item",
  "ios-action-sheet",
  "ios-alert",
  "ios-switch",
  "ios-segmented",
  "ios-segment",
  "ios-button",
  "ios-search",
  "ios-stepper",
  "chat",
  "user-message",
  "agent-message",
  "system-message",
  "tool-call",
  "agent-output",
  "reasoning",
  "message-actions",
  "suggestions",
  "typing",
  "composer",
  "citation",
  "token-usage",
  "log",
  "operation",
  "prompt-queue",
  "queue-item",
  "prompt-input-headline",
  "prompt-input-subheadline",
  "agent-input",
  "operation-tools",
  "prompt-options",
  "submit-button",
  "doc-heading",
  "doc-paragraph",
  "doc-list",
  "doc-list-item",
  "doc-ordered-list",
  "doc-unordered-list",
  "doc-quote",
  "bold",
  "italic",
  "code-inline",
  "form-field-description",
  "radio-card",
  "carousel",
  "carousel-item",
  "combobox",
  "data-table",
  "hover-card",
  "input-group",
  "menubar",
  "menubar-item",
  "nav-menu",
  "nav-menu-item",
  "scroll-area",
  "toggle-group",
  "toggle-group-item",
  "collapsible",
  "aspect-ratio",
  "field",
  "sonner",
  "separator",
  "icon",
  "bank-card-input",
  "image",
  "spinner",
  "dropdown-menu",
  "header-notification",
  "marquee",
  "qrcode"
];
function primitiveComponentTag(lang) {
  return lang.includes("-") ? lang : `${lang}-el`;
}
var EXPLICIT = {
  page: "page-el",
  view: "main-view",
  annotation: "annotation-el",
  "annotation-global": "annotation-global-el",
  enum: "enum-el",
  "enum-item": "enum-item",
  viewport: "viewport-el",
  navigator: "navbar-el",
  diagram: "diagram-block",
  space: "spacer-el"
};
var LANG_TO_COMPONENT = (() => {
  const map = {};
  for (const lang of PRIMITIVES)
    map[lang] = primitiveComponentTag(lang);
  for (const [lang, comp] of Object.entries(EXPLICIT))
    map[lang] = comp;
  return map;
})();
var LANG_ALIASES = {
  space: "spacer"
};
var COMPONENT_TO_LANG = (() => {
  const map = {};
  for (const [lang, comp] of Object.entries(LANG_TO_COMPONENT)) {
    const canonical = LANG_ALIASES[lang] ?? lang;
    if (!map[comp] || LANG_ALIASES[lang]) {
      if (!map[comp] || map[comp] === lang || !LANG_ALIASES[lang]) {
        map[comp] = canonical;
      }
    }
  }
  for (const [alias, canonical] of Object.entries(LANG_ALIASES)) {
    const comp = LANG_TO_COMPONENT[alias];
    if (comp)
      map[comp] = canonical;
  }
  return map;
})();
function toComponentTag(tag) {
  return LANG_TO_COMPONENT[tag.toLowerCase()] ?? tag;
}

// ../rpml-parser/src/index.ts
function expandSelfClosing(source) {
  return source.replace(/<([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)\/>/g, (_m, tag, attrs) => `<${tag}${attrs}></${tag}>`);
}
function rewriteTags(source) {
  return source.replace(/<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>])*)>/g, (_m, slash, tag, rest) => `<${slash}${toComponentTag(tag)}${rest}>`);
}
function normalize(source) {
  return rewriteTags(expandSelfClosing(source.trim()));
}
var PROSE_SOFT_BREAK_TAGS = new Set([
  "annotation-el",
  "annotation-global-el",
  "annotation-el-body",
  "doc-paragraph",
  "doc-list-item",
  "doc-quote",
  "doc-heading",
  "p",
  "li",
  "blockquote",
  "td",
  "th",
  "label"
]);
var PARSE_NODE_MAX_TAGS = 1e4;
function parseNode(source) {
  const norm = normalize(source);
  const stack = [];
  let root = null;
  const tagRe = /<([/]?)([a-zA-Z][\w:-]*)([^>]*)>/g;
  let m;
  let tagCount = 0;
  while ((m = tagRe.exec(norm)) !== null) {
    if (++tagCount > PARSE_NODE_MAX_TAGS) {
      throw new Error(`RPML parse error: exceeded ${PARSE_NODE_MAX_TAGS} tags (document too large or malformed)`);
    }
    const [, closing, tag, attrStr] = m;
    if (closing) {
      const node = stack.pop();
      if (stack.length)
        stack[stack.length - 1].children.push(node);
      else
        root = node;
    } else {
      const attrs = {};
      const attrRe = /([\w:-]+)(?:="([^"]*)")?/g;
      let am;
      let attrCount = 0;
      while ((am = attrRe.exec(attrStr)) !== null) {
        if (++attrCount > PARSE_NODE_MAX_TAGS) {
          throw new Error(`RPML parse error: exceeded ${PARSE_NODE_MAX_TAGS} attributes on <${tag}> (malformed attribute list)`);
        }
        if (am[1] !== attrStr.trim())
          attrs[am[1]] = am[2] ?? "";
      }
      stack.push({ tag: tag.toLowerCase(), attrs, children: [] });
    }
  }
  if (!root && stack.length)
    root = stack[0];
  if (!root)
    throw new Error("RPML parse error: no root element found");
  return root;
}

// ../rpml-validator/src/index.ts
var FORBIDDEN_IA_TAGS = new Set([
  "ia",
  "ia-el",
  "ia-priority",
  "ia-item",
  "ia-regions",
  "ia-region",
  "ia-practice",
  "ia-do",
  "ia-dont"
]);
function validate(root) {
  const errors = [];
  if (root.tag !== "page-el") {
    errors.push({
      path: "/",
      message: "Root element must be <page>",
      severity: "error"
    });
    return errors;
  }
  if (root.attrs.mode === "doc") {
    checkDocMode(root, errors);
    checkForbiddenAttrs(root, errors);
    return errors;
  }
  checkStructural(root, errors);
  checkPins(root, errors);
  checkForbiddenAttrs(root, errors);
  return errors;
}
function checkForbiddenAttrs(root, errors) {
  const walk = (node, path) => {
    const tag = node.tag.replace(/-el$/, "");
    const here = path === "/" ? `/${tag}` : `${path}/${tag}`;
    if ("style" in node.attrs && node.attrs.style !== undefined) {
      errors.push({
        path: here,
        message: 'style="..." attribute is illegal in RPML — styling is determined by element semantics, not inline CSS. Remove it.',
        severity: "error"
      });
    }
    if (FORBIDDEN_IA_TAGS.has(node.tag) || FORBIDDEN_IA_TAGS.has(tag)) {
      errors.push({
        path: here,
        message: "IA is not an RPML element. Keep page IA as a separate text/plain record (kind: ia-text); do not emit it in the .rpml file.",
        severity: "error"
      });
    }
    for (const child of node.children)
      walk(child, here);
  };
  walk(root, "");
}
function checkDocMode(root, errors) {
  if (!root.attrs.title)
    errors.push({
      path: "/page",
      message: "page missing title attribute",
      severity: "warning"
    });
  if (root.children.some((c) => c.tag === "main-view"))
    errors.push({
      path: "/page",
      message: 'doc mode has no <view> (content flows top-to-bottom); remove it or drop mode="doc"',
      severity: "warning"
    });
}
function checkStructural(root, errors) {
  const mainViews = root.children.filter((c) => c.tag === "main-view");
  if (mainViews.length === 0)
    errors.push({
      path: "/page",
      message: "Missing <view>",
      severity: "error"
    });
  if (mainViews.length > 1)
    errors.push({
      path: "/page",
      message: "Only one <view> allowed",
      severity: "error"
    });
  if (!root.attrs.title)
    errors.push({
      path: "/page",
      message: "page missing title attribute",
      severity: "warning"
    });
}
function checkPins(root, errors) {
  const mainView = root.children.find((c) => c.tag === "main-view");
  if (!mainView)
    return;
  const pinIds = collectPins(mainView, []);
  const annotationIds = root.children.filter((c) => c.tag === "annotation-el" && c.attrs.id).map((c) => c.attrs.id);
  for (const pin of pinIds) {
    if (!annotationIds.includes(pin))
      errors.push({
        path: `/view[data-pin="${pin}"]`,
        message: `data-pin="${pin}" has no matching <annotation id="${pin}">`,
        severity: "error"
      });
  }
  for (const id of annotationIds) {
    if (!pinIds.includes(id))
      errors.push({
        path: `/annotation[id="${id}"]`,
        message: `Annotation id="${id}" has no matching data-pin="${id}" in view (cross-cutting notes belong in <annotation-global>)`,
        severity: "warning"
      });
  }
  for (const g of root.children.filter((c) => c.tag === "annotation-global-el")) {
    if (g.attrs.id)
      errors.push({
        path: "/annotation-global",
        message: "annotation-global must not have an id (it is pin-less by design)",
        severity: "error"
      });
  }
}
function collectPins(node, acc) {
  if (node.attrs["data-pin"])
    acc.push(node.attrs["data-pin"]);
  for (const child of node.children)
    collectPins(child, acc);
  return acc;
}
function validateSource(source) {
  let root;
  try {
    root = parseNode(source);
  } catch (e) {
    return {
      ok: false,
      errors: [
        {
          path: "/",
          message: `Parse error: ${e.message}`,
          severity: "error"
        }
      ]
    };
  }
  const errors = validate(root);
  return { ok: errors.every((e) => e.severity !== "error"), errors };
}

// src/validate.ts
function collect(target, out = []) {
  if (!existsSync(target))
    return out;
  const st = statSync(target);
  if (st.isDirectory()) {
    for (const name of readdirSync(target)) {
      if (name.startsWith(".") || name === "node_modules")
        continue;
      collect(join(target, name), out);
    }
  } else if (/\.rpml$/i.test(target)) {
    out.push(target);
  }
  return out;
}
function check(files) {
  const problems = [];
  let errors = 0;
  for (const file of files) {
    const result = validateSource(readFileSync(file, "utf8"));
    for (const e of result.errors) {
      problems.push({ file, path: e.path, message: e.message, severity: e.severity });
      if (e.severity === "error")
        errors++;
    }
  }
  return { problems, errors };
}
function format(problems) {
  return problems.map((p) => `${p.severity === "error" ? "ERROR" : "warn "} ${p.file} ${p.path}: ${p.message}`).join(`
`);
}
function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}
function runHook() {
  let input = {};
  try {
    input = JSON.parse(readStdin() || "{}");
  } catch {
    process.exit(0);
  }
  const file = input.tool_input?.file_path;
  if (typeof file !== "string" || !/\.rpml$/i.test(file))
    process.exit(0);
  if (!resolve(file).split(sep).includes("specs"))
    process.exit(0);
  if (!existsSync(file))
    process.exit(0);
  const { problems, errors } = check([file]);
  if (errors > 0) {
    console.error(`RPML validation failed for ${file}. Fix these before continuing:
${format(problems)}`);
    process.exit(2);
  }
  if (problems.length)
    console.error(format(problems));
  process.exit(0);
}
var args = process.argv.slice(2);
if (args[0] === "--hook")
  runHook();
var targets = args.length ? args : ["specs"];
var files = targets.flatMap((t) => collect(t));
if (!files.length) {
  console.error(`No .rpml files found in: ${targets.join(", ")}`);
  process.exit(1);
}
var { problems, errors } = check(files);
if (problems.length)
  console.log(format(problems));
console.log(errors ? `
${errors} error(s) in ${files.length} file(s).` : `OK: ${files.length} file(s) valid${problems.length ? ` (${problems.length} warning(s))` : ""}.`);
process.exit(errors ? 1 : 0);
