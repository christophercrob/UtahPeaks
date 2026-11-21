import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(clientRoot, "..");
const mediaDir = path.join(clientRoot, "public", "media");

function walk(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function sourceText() {
  const files = [
    path.join(clientRoot, "index.html"),
    ...walk(path.join(clientRoot, "src")).filter(
      file => /\.(tsx?|html|css)$/.test(file) && !file.endsWith(".test.ts"),
    ),
  ];
  return files.map(file => ({ file, text: readFileSync(file, "utf8") }));
}

describe("local media", () => {
  const sources = sourceText();
  const referenced = new Set<string>();
  for (const source of sources) {
    for (const match of source.text.matchAll(/\/media\/([^"'()\s]+(?:\([^)]*\))?[^"'()\s]*)/g)) {
      referenced.add(match[1]);
    }
    // Filenames may contain parentheses. Capture the path inside quotes.
    for (const match of source.text.matchAll(/["']\/media\/([^"']+)["']/g)) {
      referenced.add(match[1]);
    }
  }

  it("points every gallery, logo, and icon at a file in client/public/media", () => {
    expect(referenced.size).toBe(45);
    for (const name of referenced) {
      const file = path.join(mediaDir, name);
      expect(statSync(file).size, name).toBeGreaterThan(0);
    }
  });

  it("matches docs/media-manifest.csv byte for byte", () => {
    const csv = readFileSync(path.join(repoRoot, "docs", "media-manifest.csv"), "utf8").trim().split("\n");
    const header = csv[0].split(",");
    const shaIndex = header.indexOf("sha256");
    const bytesIndex = header.indexOf("bytes");
    const newPathIndex = header.indexOf("new_path");
    expect(shaIndex).toBeGreaterThan(0);
    const rows = csv.slice(1).map(line => {
      const cols: string[] = [];
      let current = "";
      let quoted = false;
      for (const char of line) {
        if (char === '"') {
          quoted = !quoted;
          continue;
        }
        if (char === "," && !quoted) {
          cols.push(current);
          current = "";
          continue;
        }
        current += char;
      }
      cols.push(current);
      return cols;
    });
    expect(rows).toHaveLength(45);
    const byName = new Map(rows.map(cols => [path.posix.basename(cols[newPathIndex]), cols]));
    expect(byName.size).toBe(referenced.size);
    for (const name of referenced) {
      const cols = byName.get(name);
      expect(cols, name).toBeTruthy();
      const data = readFileSync(path.join(mediaDir, name));
      expect(data.length, name).toBe(Number(cols![bytesIndex]));
      expect(createHash("sha256").update(data).digest("hex"), name).toBe(cols![shaIndex]);
    }
  });

  it("does not leave Manus runtime references in the client", () => {
    const combined = sources.map(source => source.text).join("\n");
    expect(combined).not.toMatch(/manus-storage|manus-analytics|umami|forge\.butterfly|%VITE_|vite-plugin-manus|__manus__/);
    const server = readFileSync(path.join(repoRoot, "server", "index.ts"), "utf8");
    expect(server).toContain('"/manus-storage/:key"');
    expect(server).toContain("CANONICAL_REDIRECT");
    const pkg = readFileSync(path.join(repoRoot, "package.json"), "utf8");
    expect(pkg).not.toContain("vite-plugin-manus-runtime");
    const viteConfig = readFileSync(path.join(repoRoot, "vite.config.ts"), "utf8");
    expect(viteConfig).not.toMatch(/manus|forge\.butterfly/);
  });
});
