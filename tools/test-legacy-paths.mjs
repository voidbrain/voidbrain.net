#!/usr/bin/env node
// Legacy path test (F-002): serves the production build with a real Apache, next to stub copies of the
// old site's folders and the old site under /old/, and checks every rule in public/.htaccess and
// public/old/.htaccess by status code and redirect target. Also fails when public/ holds an entry named
// like a legacy folder (the deploy would overwrite it).
//
// Usage: npm run build && npm run test:legacy
// Needs Apache 2.4 with mod_rewrite: macOS /usr/sbin/httpd, or Debian/Ubuntu apache2 (HTTPD=/usr/sbin/apache2).
// No PHP is needed: the old site's entry points are stubs, so the test checks where requests are routed.
import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = join(root, 'dist/voidbrain-net/browser');

// What the legacy docroot on the host holds today, besides the old site's own entry files
// (listing of the `voidbrain` repository's public/ folder, 2026-11-24). This is an outside fact:
// update it when the server changes.
export const LEGACY_FOLDERS = [
  'admin', 'base', 'cgi-bin', 'cube', 'extradry', 'fonts', 'grover', 'hammer', 'img', 'inc', 'include',
  'js', 'laura', 'maiko', 'min', 'misc', 'pasubio', 'style', 'summer2020', 'support', 'temp', 'template',
  'templates', 'test', 'uboard', 'wip',
];
export const LEGACY_FILES = ['BingSiteAuth.xml', 'googleba637e5c36f03a69.html', 'humans.txt'];
// Entries the new build may own at the docroot (AGENTS, "Known pitfalls").
const ALLOWED_PUBLIC = new Set(['.htaccess', '404.html', 'assets', 'favicon.ico', 'models', 'old', 'robots.txt', 'sitemap.xml']);

const failures = [];
const fail = (msg) => failures.push(msg);

// 1. public/ must not collide with the legacy docroot.
const legacyNames = new Set([...LEGACY_FOLDERS, ...LEGACY_FILES].map((n) => n.toLowerCase()));
for (const entry of readdirSync(join(root, 'public'))) {
  if (legacyNames.has(entry.toLowerCase())) fail(`public/${entry} has the name of a legacy docroot entry`);
  else if (!ALLOWED_PUBLIC.has(entry)) fail(`public/${entry} is not in the allowed docroot entries (AGENTS, "Known pitfalls")`);
}

if (!existsSync(join(dist, 'index.html'))) {
  console.error('No build in dist/voidbrain-net/browser: run `npm run build` first.');
  process.exit(1);
}

// 2. A docroot as the server will have it: the old site's stubs, the legacy folders, then the new build on top.
const work = mkdtempSync(join(tmpdir(), 'vb-legacy-'));
const docroot = join(work, 'htdocs');
mkdirSync(docroot);
writeFileSync(join(docroot, 'index.php'), 'LEGACY_ROOT_PHP'); // the old entry point, until it is removed
writeFileSync(join(docroot, 'sitemap.php'), 'LEGACY_SITEMAP_PHP');
for (const name of LEGACY_FOLDERS) {
  mkdirSync(join(docroot, name), { recursive: true });
  writeFileSync(join(docroot, name, 'index.html'), `LEGACY ${name}`);
  writeFileSync(join(docroot, name, 'x.txt'), `LEGACY FILE ${name}`);
}
for (const name of LEGACY_FILES) writeFileSync(join(docroot, name), `LEGACY ${name}`);
// The old site copied to /old/ (DESIGN, "Legacy paths", deploy steps).
for (const [file, body] of [
  ['old/index.php', 'OLD_INDEX'],
  ['old/sitemap.php', 'OLD_SITEMAP'],
  ['old/templates/pages.php', 'OLD_PAGES'],
  ['old/img/a.png', 'OLD_IMAGE'],
  ['old/style/style.css', 'OLD_STYLE'],
]) {
  mkdirSync(join(docroot, file, '..'), { recursive: true });
  writeFileSync(join(docroot, file), body);
}
cpSync(dist, docroot, { recursive: true });

// 3. Apache with only the modules the rules use.
const httpd = process.env.HTTPD ?? ['/usr/sbin/httpd', '/usr/sbin/apache2'].find(existsSync);
const modules = process.env.HTTPD_MODULES ?? ['/usr/libexec/apache2', '/usr/lib/apache2/modules'].find(existsSync);
const mimeTypes = ['/etc/apache2/mime.types', '/etc/mime.types'].find(existsSync);
if (!httpd || !modules) {
  console.error('Apache not found: set HTTPD and HTTPD_MODULES.');
  process.exit(1);
}
const port = await new Promise((done) => {
  const s = createServer().listen(0, '127.0.0.1', () => {
    const { port } = s.address();
    s.close(() => done(port));
  });
});
const mods = ['mpm_prefork', 'authz_core', 'dir', 'mime', 'rewrite', 'headers', 'log_config', 'unixd'].filter((m) =>
  existsSync(join(modules, `mod_${m}.so`)),
);
writeFileSync(
  join(work, 'httpd.conf'),
  [
    `ServerRoot "${work}"`,
    `Listen 127.0.0.1:${port}`,
    `ServerName 127.0.0.1`,
    ...mods.map((m) => `LoadModule ${m}_module "${join(modules, `mod_${m}.so`)}"`),
    `PidFile "${join(work, 'httpd.pid')}"`,
    `ErrorLog "${join(work, 'error.log')}"`,
    mimeTypes ? `TypesConfig "${mimeTypes}"` : '',
    `DocumentRoot "${docroot}"`,
    `<Directory "${docroot}">`,
    '  AllowOverride All',
    '  Require all granted',
    '</Directory>',
  ].join('\n'),
);
const server = spawn(httpd, ['-f', join(work, 'httpd.conf'), '-DFOREGROUND'], { stdio: ['ignore', 'inherit', 'inherit'], detached: true });
const base = `http://127.0.0.1:${port}`;
for (let i = 0; ; i++) {
  try {
    await fetch(base + '/robots.txt');
    break;
  } catch {
    if (i > 50) {
      server.kill();
      console.error('Apache did not start; see', join(work, 'error.log'));
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, 100));
  }
}

// 4. The cases: [path, status, redirect path or null, text the body or a header must contain].
const home = ['/', 301, '/'];
const cases = [
  ['/', 200, null, '<vb-root'],
  ['/index.html', 200, null, '<vb-root'],
  ...['/home', '/about', '/about/', '/about/me', '/about/work', '/About/Work', '/labs', '/labs/some-lab', '/contacts', '/contacts/', '/a/b/c'].map(
    (p) => [p, home[1], home[2]],
  ),
  ['/contacts.php', 301, '/'],
  ['/index.php', 301, '/'],
  ['/sitemap.php', 301, '/'],
  ['/?url=about/me', 301, '/'],
  ['/about?url=x', 301, '/'],
  ['/?_escaped_fragment_=about', 301, '/'],
  ['/api', 410],
  ['/api/pages/1', 410],
  ['/missing.png', 404, null, 'SIGNAL_LOST'],
  ['/.git/config', 403],
  ['/robots.txt', 200, null, 'Disallow: /old/'],
  ['/sitemap.xml', 200, null, '<urlset'],
  ['/favicon.ico', 200],
  ['/old', 301, '/old/'],
  ['/old/', 301, '/old/home'],
  ['/old/home', 200, null, 'OLD_INDEX'],
  ['/old/about/me', 200, null, 'OLD_INDEX'],
  ['/old/about/work/', 200, null, 'OLD_INDEX'],
  ['/old/contacts', 200, null, 'OLD_INDEX'],
  ['/old/labs/some-lab', 200, null, 'OLD_PAGES'],
  ['/old/api/pages', 200, null, 'OLD_INDEX'],
  ['/old/sitemap.xml', 200, null, 'OLD_SITEMAP'],
  ['/old/img/a.png', 200, null, 'OLD_IMAGE'],
  ['/old/style/style.css', 200, null, 'OLD_STYLE'],
  ['/old/home', 200, null, 'x-robots-tag: noindex'],
  ...LEGACY_FOLDERS.flatMap((n) => [
    [`/${n}`, 301, `/${n}/`],
    [`/${n}/`, 200, null, `LEGACY ${n}`],
    [`/${n}/x.txt`, 200, null, `LEGACY FILE ${n}`],
  ]),
  ...LEGACY_FILES.map((n) => [`/${n}`, 200, null, `LEGACY ${n}`]),
];

try {
  for (const [path, status, location, contains] of cases) {
    const res = await fetch(base + path, { redirect: 'manual' });
    const body = await res.text();
    const headers = [...res.headers].map(([k, v]) => `${k}: ${v}`).join('\n');
    const where = res.headers.get('location');
    const got = where ? new URL(where, base) : null;
    if (res.status !== status) fail(`${path}: status ${res.status}, expected ${status}${where ? ` (→ ${where})` : ''}`);
    else if (location && (got?.pathname + (got?.search ?? '')) !== location)
      fail(`${path}: redirects to ${where}, expected ${location}`);
    else if (contains && !body.includes(contains) && !headers.toLowerCase().includes(contains.toLowerCase()))
      fail(`${path}: response does not contain ${JSON.stringify(contains)}`);
  }
} finally {
  server.kill();
  await new Promise((r) => server.once('exit', r));
  if (!failures.length) rmSync(work, { recursive: true, force: true });
}

if (failures.length) {
  console.error(failures.map((f) => `✗ ${f}`).join('\n'));
  console.error(`\n${failures.length} legacy path check(s) failed; Apache files kept in ${work}`);
  process.exit(1);
}
console.log(`Legacy paths: ${cases.length} Apache requests and the public/ names check passed.`);
