// Named alteration operations. Each takes geometry (cm, y down) and returns
// { points, changes, checks }. Operations only move the points they are
// allowed to move and run the checks from checks.js afterwards.
import { maxTurnCheck, armholeUnchangedCheck, frontBackSplitCheck } from './checks.js';

// Principle: uneven side-seam change is split front 1/4, back 1/2.
export function splitSideChange(sideChangeCm) {
  return { front: 0.25 * sideChangeCm, back: 0.5 * sideChangeCm };
}

// Principle: changes taper out to nothing at the ends, so the new line blends in.
// Moves points whose y lies between fromY and toY by a linearly tapered offset.
// Points outside the band (e.g. the armhole above fromY) are not moved.
export function taperSideSeam(points, { sideSign, deltaCm, fromY, toY, fixedAboveY }) {
  const out = points.map(([x, y]) => {
    if (y < fixedAboveY) return [x, y];          // armhole / neck stay fixed
    let w;
    if (y <= fromY) w = 0;
    else if (y >= toY) w = 0;                    // taper to nothing at the far end
    else {
      const mid = (fromY + toY) / 2;
      w = y <= mid ? (y - fromY) / (mid - fromY) : (toY - y) / (toY - mid);
    }
    return [x + sideSign * deltaCm * w, y];
  });
  return out;
}

// Runs an operation's checks against the original geometry.
export function runChecks(before, after, { maxTurnDeg = 35, armholeIdx = null, armholeTolCm = 0.5 } = {}) {
  const results = { turn: maxTurnCheck(after, maxTurnDeg) };
  if (armholeIdx) {
    const b = before.filter((_, i) => armholeIdx.includes(i));
    const a = after.filter((_, i) => armholeIdx.includes(i));
    results.armhole = armholeUnchangedCheck(b, a, armholeTolCm);
  }
  return results;
}

export function allOk(results) {
  return Object.values(results).every((r) => r.ok);
}

export { frontBackSplitCheck };

// Principle: pivot method. Rotate a set of points about a pivot point, so the
// piece is re-hung without stretching its edges (lengths are preserved).
export function pivotPoints(points, { pivot, angleDeg, select }) {
  const a = (angleDeg * Math.PI) / 180;
  const c = Math.cos(a), s = Math.sin(a);
  return points.map((p, i) => {
    if (!select(p, i)) return p;
    const dx = p[0] - pivot[0], dy = p[1] - pivot[1];
    return [pivot[0] + dx * c - dy * s, pivot[1] + dx * s + dy * c];
  });
}

// Principle: slash and spread. Cut along a horizontal line and open it by a
// set amount. Points below the slash move by the spread; points above stay.
// Taper and blending are handled by a separate taper operation.
export function slashAndSpread(points, { slashY, spreadCm, sideSign = 1 }) {
  return points.map(([x, y]) => (y > slashY ? [x + sideSign * spreadCm, y] : [x, y]));
}

// Each operation's principle IDs, so a run can say which rules it relied on.
export const OPERATION_PRINCIPLES = {
  split_side_change: ['uneven-side-split'],
  taper_side_seam: ['taper-to-nothing', 'armhole-drafted-from-points'],
  pivot_points: ['taper-to-nothing'],
  slash_and_spread: ['taper-to-nothing', 'side-seams-match'],
};
