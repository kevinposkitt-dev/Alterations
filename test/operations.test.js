import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitSideChange, taperSideSeam, runChecks, allOk } from '../knowledge/operations.js';
import { frontBackSplitCheck } from '../knowledge/checks.js';

// Simple side seam: armhole (y < 10) then a side seam down to the hem at y = 60.
const side = [[10, 0], [10, 5], [10, 10], [10, 20], [10, 30], [10, 40], [10, 50], [10, 60]];

test('split rule: front quarter, back half of the side change', () => {
  const s = splitSideChange(4);
  assert.equal(s.front, 1);
  assert.equal(s.back, 2);
  assert.equal(frontBackSplitCheck(s.front, s.back, 4).ok, true);
});

test('taper leaves points above the armhole untouched and tapers to nothing at the hem', () => {
  const out = taperSideSeam(side, { sideSign: 1, deltaCm: 2, fromY: 10, toY: 60, fixedAboveY: 10 });
  assert.deepEqual(out[0], side[0]);            // above armhole: unchanged
  assert.deepEqual(out[2], side[2]);            // at fromY: unchanged
  assert.ok(Math.abs(out[7][0] - side[7][0]) < 1e-9); // at hem: back to original
  assert.ok(out[4][0] > side[4][0]);            // middle: moved out
});

test('a gentle taper passes all checks, a steep one fails the turn check', () => {
  const gentle = taperSideSeam(side, { sideSign: 1, deltaCm: 2, fromY: 10, toY: 60, fixedAboveY: 10 });
  assert.equal(allOk(runChecks(side, gentle, { maxTurnDeg: 35, armholeIdx: [0, 1, 2] })), true);
  const steep = taperSideSeam(side, { sideSign: 1, deltaCm: 30, fromY: 19, toY: 23, fixedAboveY: 10 });
  assert.equal(allOk(runChecks(side, steep, { maxTurnDeg: 35 })), false);
});

test('armhole check fails if a fixed armhole point is moved', () => {
  const moved = side.map((p, i) => (i === 1 ? [p[0] + 5, p[1]] : p));
  const r = runChecks(side, moved, { armholeIdx: [0, 1, 2] });
  assert.equal(r.armhole.ok, false);
});
