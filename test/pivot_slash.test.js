import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pivotPoints, slashAndSpread, taperSideSeam, runChecks, allOk, OPERATION_PRINCIPLES } from '../knowledge/operations.js';

// Trouser-leg side seam (cm): hip at y=0, knee at y=50, hem at y=100. Hip is at x=0.
const leg = [[0, 0], [0, 25], [0, 50], [0, 75], [0, 100]];

test('pivot preserves the length of the rotated edge (rigid rotation)', () => {
  const rot = pivotPoints(leg, { pivot: [0, 0], angleDeg: 5, select: (p) => p[1] > 40 });
  const len = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
  // Only the lower part moved; its own length is unchanged.
  const idx = [2, 3, 4];
  assert.ok(Math.abs(len(idx.map((i) => rot[i])) - len(idx.map((i) => leg[i]))) < 1e-9);
  assert.deepEqual(rot[0], leg[0]);
});

test('slash and spread opens the lower leg by the set amount and leaves the top fixed', () => {
  const out = slashAndSpread(leg, { slashY: 40, spreadCm: 3 });
  assert.deepEqual(out[0], leg[0]);     // above the slash: fixed
  assert.equal(out[3][0], 3);           // below the slash: opened
});

test('trouser case: thigh width added at the side, tapered out at the hem, passes checks', () => {
  const widened = taperSideSeam(leg, { sideSign: 1, deltaCm: 2, fromY: 0, toY: 100, fixedAboveY: -1 });
  const r = runChecks(leg, widened, { maxTurnDeg: 35 });
  assert.equal(allOk(r), true);
  assert.equal(widened[4][0], 0);       // back to the original at the hem
});

test('every operation is linked to at least one principle id', () => {
  for (const [op, ids] of Object.entries(OPERATION_PRINCIPLES)) {
    assert.ok(ids.length > 0, op);
  }
});
