import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { makeProblem, makeRng } from '../app/js/problems.js';
import { SKILLS } from '../app/js/skills.js';
import { TROPHIES } from '../app/js/trophies.js';
import { ITEMS } from '../app/js/unlocks.js';

const kana = /[\u3040-\u30ff]/;

test('Chinese problem prompts cover every skill, including fractions and remainders', () => {
  const rng = makeRng(20260930);
  for (const skill of SKILLS) {
    assert.doesNotMatch(skill.name, kana);
    for (let i = 0; i < 100; i++) {
      const problem = makeProblem(skill.id, rng);
      assert.doesNotMatch(JSON.stringify(problem), kana, skill.id);
    }
  }
  for (const item of [...TROPHIES, ...ITEMS]) {
    assert.doesNotMatch(`${item.name} ${item.desc || ''}`, kana, item.id);
  }
});

test('interface source has no Japanese text except the preserved original logo and comments', () => {
  const root = new URL('../app/', import.meta.url);
  const html = readFileSync(new URL('index.html', root), 'utf8');
  assert.match(html, /lang="zh-CN"/);
  assert.match(html, /非官方简体中文版/);
  assert.doesNotMatch(html.replace(/<h1 id="logo"[\s\S]*?<\/h1>/, ''), kana);
  for (const name of readdirSync(new URL('js/', root)).filter((f) => f.endsWith('.js'))) {
    const source = readFileSync(new URL(`js/${name}`, root), 'utf8');
    const code = source.split('\n').filter((line) => !line.trimStart().startsWith('//')).join('\n');
    assert.doesNotMatch(code, kana, name);
  }
});
