#!/usr/bin/env node
/**
 * Compile a directory of .rpml files into one self-contained HTML page for a
 * Claude Artifact. Zero dependencies (Node >= 18).
 *
 *   node build-artifact.mjs [--specs specs] [--out .origin/artifact.html] [--title "Name"]
 *
 * The page inlines the docs and the RPUI canvas runtime (assets/gallery.js).
 * Everything non-ASCII except the <title> is \u-escaped so the page renders
 * the same whatever encoding the host decodes it with.
 *
 * ORIGIN_PLUGIN_ASSETS_DIR overrides where gallery.js / brand.svg are read from (tests).
 */
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative, sep, dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const MAX_BYTES = 12 * 1024 * 1024; // Artifact pages are capped at 16MB; leave headroom.

function parseArgs(argv) {
  const o = { specs: "specs", out: join(".origin", "artifact.html"), title: "" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--specs") o.specs = argv[++i] ?? o.specs;
    else if (a === "--out") o.out = argv[++i] ?? o.out;
    else if (a === "--title") o.title = argv[++i] ?? "";
    else if (a === "-h" || a === "--help") {
      console.log("Usage: build-artifact.mjs [--specs specs] [--out .origin/artifact.html] [--title Name]");
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${a}`);
      process.exit(1);
    }
  }
  return o;
}

function collectRpml(dir) {
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      if (name.startsWith(".") || name === "node_modules") continue;
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.rpml$/i.test(name)) {
        out.push({ path: relative(dir, full).split(sep).join("/"), source: readFileSync(full, "utf8") });
      }
    }
  };
  walk(dir);
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

/** \u-escape DEL and every non-ASCII char (valid inside JS strings, regex and template literals). */
const ascii = (t) => t.replace(/[\u007f-￿]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));

function jsonForScript(value) {
  return ascii(
    JSON.stringify(value)
      .replace(/<\/script/gi, "<\\/script")
      .replace(/<!--/g, "<\\!--"),
  );
}

function pageTitle(docs, fallback) {
  const readme = docs.find((d) => /^(readme|index)\.rpml$/i.test(d.path)) ?? docs[0];
  const m = readme?.source.match(/<page\b[^>]*\btitle="([^"]*)"/i);
  return (m?.[1] || fallback).trim();
}

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const opts = parseArgs(process.argv.slice(2));
const specsDir = resolve(opts.specs);
if (!existsSync(specsDir) || !statSync(specsDir).isDirectory()) {
  console.error(`No specs directory at ${opts.specs}. Run /originai-product-spec:init first.`);
  process.exit(1);
}
const docs = collectRpml(specsDir);
if (!docs.length) {
  console.error(`No .rpml files in ${opts.specs}.`);
  process.exit(1);
}

const assetsDir = process.env.ORIGIN_PLUGIN_ASSETS_DIR || join(root, "assets");
const galleryPath = join(assetsDir, "gallery.js");
if (!existsSync(galleryPath)) {
  console.error(`Missing ${galleryPath}. The plugin was not built: run \`bun run --cwd packages/claude-plugin-local build\` in the Origin repo.`);
  process.exit(1);
}
const brandPath = join(assetsDir, "brand.svg");
const brandSvg = existsSync(brandPath) ? readFileSync(brandPath, "utf8").trim() : "";

const title = opts.title || pageTitle(docs, `${basename(process.cwd())} Specs`);
const chrome = {
  useSpec: false,
  more: false,
  theme: "auto",
  brand: brandSvg
    ? { prefix: "Built with", label: "OriginAI", href: "https://getoriginai.com", svg: brandSvg }
    : false,
};

const template = readFileSync(join(here, "page.template.html"), "utf8");
const html = template
  .replace("@@TITLE@@", () => escapeHtml(title))
  .replace("@@DOCS@@", () => jsonForScript(docs))
  .replace("@@TITLE_JSON@@", () => jsonForScript(title))
  .replace("@@CHROME@@", () => jsonForScript(chrome))
  .replace("@@GALLERY@@", () => ascii(readFileSync(galleryPath, "utf8")).replace(/<\/script/gi, "<\\/script"));

const bytes = Buffer.byteLength(html);
if (bytes > MAX_BYTES) {
  console.error(`Page is ${(bytes / 1048576).toFixed(1)}MB, over the ${MAX_BYTES / 1048576}MB budget (Artifact limit is 16MB). Split the specs.`);
  process.exit(1);
}
const outPath = resolve(opts.out);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, html);
console.log(JSON.stringify({ out: outPath, title, docs: docs.length, bytes }));
