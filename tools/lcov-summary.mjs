#!/usr/bin/env node
// LCOV to the standard coverage summary, for test runners that write only LCOV (the Node test runner:
// `node --test --experimental-test-coverage --test-reporter=lcov --test-reporter-destination=coverage/lcov.info`).
// tools/coverage-table.mjs reads the "json-summary" format (Istanbul / V8); this writes it from LCOV.
// Source files under the coverage folders that no test loaded are added at zero (their line count from the source,
// a close estimate), so they show as untested instead of missing. LCOV has no statements: they are reported equal to
// lines. Code run only in child processes started with a clean environment is not counted.
//   node tools/lcov-summary.mjs        reads coverage.lcov (default coverage/lcov.info), writes coverage.summary
// Settings: .harness.json "coverage": { lcov?, summary?, folders: ["src/", …] } (folders as for coverage-table).
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// resolved, because test runners write resolved paths (/private/var on macOS, not /var)
const root = realpathSync(fileURLToPath(new URL('..', import.meta.url)));

/** Per-file metrics from LCOV text: lines, branches and functions found and hit. */
export function parseLcov(text) {
  const files = {};
  let cur = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('SF:')) {
      cur = { path: line.slice(3), LF: 0, LH: 0, BRF: 0, BRH: 0, FNF: 0, FNH: 0 };
      continue;
    }
    if (!cur) continue;
    if (line === 'end_of_record') {
      files[cur.path] = cur;
      cur = null;
      continue;
    }
    const m = /^(LF|LH|BRF|BRH|FNF|FNH):(\d+)$/.exec(line);
    if (m) cur[m[1]] = Number(m[2]);
  }
  return files;
}
const metric = (total, covered) => ({
  total,
  covered,
  skipped: 0,
  pct: total ? Math.round((10000 * covered) / total) / 100 : 100,
});
const entry = (f) => ({
  lines: metric(f.LF, f.LH),
  statements: metric(f.LF, f.LH),
  branches: metric(f.BRF, f.BRH),
  functions: metric(f.FNF, f.FNH),
});
const sourceFile = (name) =>
  /\.(ts|tsx|js|mjs|cjs)$/.test(name) && !/\.(test|spec)\.[cm]?[jt]sx?$/.test(name) && !name.endsWith('.d.ts');

/** The json-summary for the files under `folders` (repository-relative, e.g. "src/"), untested sources added at zero. */
export function toSummary(files, { rootDir = root, folders = ['src/'] } = {}) {
  const relOf = (abs) => relative(rootDir, abs).split('\\').join('/');
  const inside = (abs) => {
    const r = relOf(abs);
    return !r.startsWith('..') && folders.some((f) => r.startsWith(f));
  };
  const out = {};
  for (const f of Object.values(files)) {
    const abs = resolve(rootDir, f.path);
    if (inside(abs)) out[abs] = entry(f);
  }
  for (const folder of folders) {
    const dir = join(rootDir, folder);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir, { recursive: true }).map(String)) {
      const abs = join(dir, name);
      if (out[abs] || !sourceFile(name) || name.split(/[\\/]/).includes('node_modules')) continue;
      const lines = readFileSync(abs, 'utf8')
        .split('\n')
        .filter((l) => l.trim() && !/^\s*(\/\/|\/\*|\*)/.test(l)).length;
      out[abs] = entry({ LF: lines, LH: 0, BRF: 0, BRH: 0, FNF: 0, FNH: 0 });
    }
  }
  const sum = (k) =>
    metric(
      Object.values(out).reduce((a, m) => a + m[k].total, 0),
      Object.values(out).reduce((a, m) => a + m[k].covered, 0),
    );
  return {
    total: {
      lines: sum('lines'),
      statements: sum('statements'),
      branches: sum('branches'),
      functions: sum('functions'),
    },
    ...out,
  };
}

const direct = (() => {
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1] ?? '');
  } catch {
    return false;
  }
})();
if (direct) {
  const stampUrl = new URL('../.harness.json', import.meta.url);
  const cfg = (existsSync(stampUrl) ? JSON.parse(readFileSync(stampUrl, 'utf8')) : {}).coverage ?? {};
  const input = resolve(root, cfg.lcov ?? 'coverage/lcov.info'),
    output = resolve(root, cfg.summary ?? 'coverage/coverage-summary.json');
  if (!existsSync(input)) {
    console.error(`No ${relative(root, input)}: run the tests with coverage (LCOV reporter) first.`);
    process.exit(1);
  }
  const folders = Array.isArray(cfg.folders) && cfg.folders.length ? cfg.folders : ['src/'];
  const summary = toSummary(parseLcov(readFileSync(input, 'utf8')), { folders });
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(summary, null, 1)}\n`);
  console.log(
    `${relative(root, output)}: ${Object.keys(summary).length - 1} file(s); lines ${summary.total.lines.pct} %, branches ${summary.total.branches.pct} %`,
  );
}
