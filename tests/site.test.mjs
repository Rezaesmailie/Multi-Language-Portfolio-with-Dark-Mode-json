import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const html = read('index.html');
const css = read('styles.css');
const js = read('script.js');
const translations = JSON.parse(read('languages.json'));

test('all languages exist and share exactly the same nonempty keys', () => {
  const base = Object.keys(translations.en).sort();
  assert.ok(base.length >= 60, 'Expected full interface translation coverage');
  for (const language of ['en', 'fa', 'de']) {
    const values = translations[language];
    assert.ok(values, 'Missing dictionary for ' + language);
    assert.deepEqual(Object.keys(values).sort(), base);
    for (const [key, value] of Object.entries(values)) {
      assert.equal(typeof value, 'string', language + '.' + key + ' must be a string');
      assert.ok(value.trim(), language + '.' + key + ' is empty');
    }
  }
});

test('each translated element has a matching dictionary key', () => {
  const htmlKeys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(match => match[1]);
  assert.ok(htmlKeys.length > 40, 'Not enough translated UI elements');
  for (const key of htmlKeys) {
    for (const language of ['en', 'fa', 'de']) {
      assert.ok(Object.hasOwn(translations[language], key), 'Missing ' + language + '.' + key);
    }
  }
});

test('all hash links target unique existing element IDs', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.includes(id), 'Broken internal navigation: #' + id);
  }
  assert.ok(ids.includes('main'));
  for (const section of ['home', 'about', 'expertise', 'projects', 'contact']) {
    assert.ok(ids.includes(section), 'Missing #' + section);
  }
});

test('has baseline SEO, accessibility, reduced motion and RTL support', () => {
  assert.match(html, /<html lang="en" dir="ltr">/);
  assert.match(html, /<main id="main">/);
  assert.match(html, /<h1\b/);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, 'Exactly one h1');
  for (const name of ['description', 'theme-color', 'viewport']) {
    assert.ok(html.includes('name="' + name + '"'));
  }
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(css, /\[dir="rtl"\]/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
  assert.match(js, /root\.dir\s*=/);
  assert.match(js, /textContent\s*=/);
});

test('only public project repositories are linked and new windows are protected', () => {
  const projectLinks = [...html.matchAll(/href="(https:\/\/github\.com\/RezaEsmailGol\/[^"]+)"\s+target="_blank"\s+rel="noopener noreferrer"/g)].map(m => m[1]);
  assert.ok(projectLinks.length >= 6, 'Expected selected public GitHub projects');
  assert.ok(!html.includes('http://bmq.ir'), 'Mixed-content translation endpoint must be removed');
  assert.ok(!js.includes('http://bmq.ir'), 'Script must not fetch from legacy backend');
});

test('all required local assets exist', () => {
  for (const path of ['index.html', 'styles.css', 'script.js', 'languages.json', 'favicon.svg', 'docs/portfolio-illustration.svg']) {
    assert.ok(existsSync(resolve(root, path)), 'Missing asset: ' + path);
  }
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /src="script\.js"/);
  assert.match(js, /fetch\("\.\/languages\.json"\)/);
});

test('filters cover every project with supported categories', () => {
  const categories = [...html.matchAll(/class="project-card" data-category="([^"]+)"/g)].map(match => match[1]);
  assert.ok(categories.length >= 6);
  for (const category of categories) assert.ok(['web', 'ai'].includes(category));
  for (const filter of ['all', 'web', 'ai']) {
    assert.match(html, new RegExp('data-filter="' + filter + '"'));
  }
});


test('aria labels are translated for all supported languages', () => {
  const keys = [...html.matchAll(/data-i18n-aria-label="([^"]+)"/g)].map(match => match[1]);
  assert.ok(keys.length >= 8, 'Expected translated accessible names');
  for (const lang of ['en','fa','de']) {
    for (const key of keys) assert.ok(translations[lang][key], 'Missing aria translation: ' + lang + '.' + key);
  }
});

test('sharing locale links and social metadata are implemented', () => {
  assert.match(js, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(js, /history\.replaceState/);
  assert.match(html, /meta property="og:locale"/);
  assert.match(html, /meta name="twitter:title"/);
  assert.match(html, /meta name="twitter:description"/);
  assert.match(html, /name="robots"/);
});
