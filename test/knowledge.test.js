import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maxTurnCheck, armholeUnchangedCheck, frontBackSplitCheck, targetsCheck } from '../knowledge/checks.js';
import { readFileSync } from 'node:fs';

test('a straight side seam passes the turn check', () => {
  const r = maxTurnCheck([[0, 0], [0, 10], [0, 20], [0, 30]], 35);
  assert.equal(r.ok, true);
});

test('a sharp bulge fails the turn check', () => {
  const r = maxTurnCheck([[0, 0], [0, 10], [9, 14], [0, 20]], 35);
  assert.equal(r.ok, false);
});

test('armhole check passes when the armhole is unchanged and fails when it changes', () => {
  const arm = [[0, 0], [3, 2], [6, 6], [7, 10]];
  assert.equal(armholeUnchangedCheck(arm, arm).ok, true);
  assert.equal(armholeUnchangedCheck(arm, [[0, 0], [3, 2], [9, 6], [7, 10]]).ok, false);
});

test('front/back split follows the one-quarter / one-half rule', () => {
  assert.equal(frontBackSplitCheck(1.0, 2.0, 4.0).ok, true);
  assert.equal(frontBackSplitCheck(2.0, 2.0, 4.0).ok, false);
});

test('targets check reports which measurement is off', () => {
  const r = targetsCheck({ bust: 9.25, waist: 6.9 }, { bust: 9.25, waist: 6.38 });
  assert.equal(r.ok, false);
  assert.match(r.detail, /waist/);
});

test('principles file is valid JSON with sources on every record', () => {
  const p = JSON.parse(readFileSync(new URL('../knowledge/principles.json', import.meta.url), 'utf8'));
  assert.ok(p.principles.length >= 8);
  for (const r of p.principles) {
    assert.ok(r.id && r.statement && r.source && r.source.book && r.source.pages, r.id);
  }
});
