// Regression guard: in-world technology failures are not gameplay content.
// Do not block real developer errors, save validation, or player injuries.
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..', 'src');
const playable = ['artifact', 'ui-v2'];
const banned = [
  ['fictional champion/item/skill bug', /(?:챔피언|스킬|아이템|룬|게임\s*클라이언트).{0,24}(?:버그|악용)/i],
  ['fictional technology outage', /(?:서버|네트워크|회선|장비|전력|중계|방송|송출|클라이언트).{0,24}(?:장애|고장|두절|다운|정전|기술\s*사고|송출\s*실패)/i],
  ['fictional technical incident', /(?:기술(?:적)?\s*(?:사고|장애)|server\s+outage|equipment\s+failure|broadcast\s+outage|game\s+breaking\s+bug)/i],
  ['bug-triggered competitive ban', /(?:버그.{0,28}(?:글로벌|프로\s*밴)|(?:글로벌|프로\s*밴).{0,28}버그)/i],
];
const violations = [];
for (const directory of playable) {
  const dir = resolve(root, directory);
  for (const file of await readdir(dir)) {
    if (!/\.(?:js|html)$/.test(file)) continue;
    // Static champion/system snapshots are data, not generators of story events.
    if (file === 'champion-source.js' || file === 'system-source.js') continue;
    const source = await readFile(resolve(dir, file), 'utf8');
    for (const [index, line] of source.split(/\r?\n/).entries()) {
      // Diagnostics concern actual software/storage errors, not invented events.
      if (/\b(?:throw|console\.)\b/.test(line)) continue;
      for (const [name, pattern] of banned) {
        if (pattern.test(line)) violations.push(`${directory}/${file}:${index + 1} [${name}]`);
      }
    }
  }
}
// Also check the shipped standalone HTML; its contents may lag behind source.
const standalone = await readFile(resolve(root, '..', 'index.html'), 'utf8');
for (const [index, line] of standalone.split(/\r?\n/).entries()) {
  if (/\b(?:throw|console\.)\b/.test(line)) continue;
  for (const [name, pattern] of banned) {
    if (pattern.test(line)) violations.push(`index.html:${index + 1} [${name}]`);
  }
}
assert.equal(violations.length, 0, 'Forbidden in-world technical incident content:\n' + violations.join('\n'));
console.log('PASS: no fictional technical incident/bug event literals in playable sources');
