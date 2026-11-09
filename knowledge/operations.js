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
