// Checks that run after every alteration. Units: cm for geometry, inches for widths.
// Each check returns {ok, detail}.

export function maxTurnCheck(points, maxDeg) {
  let worst = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const a = Math.atan2(points[i][1] - points[i - 1][1], points[i][0] - points[i - 1][0]);
    const b = Math.atan2(points[i + 1][1] - points[i][1], points[i + 1][0] - points[i][0]);
    let d = ((b - a) * 180) / Math.PI;
    d = ((d + 540) % 360) - 180;
    worst = Math.max(worst, Math.abs(d));
  }
  return { ok: worst <= maxDeg, detail: `largest turn ${worst.toFixed(1)} deg (limit ${maxDeg})` };
}

export function armholeUnchangedCheck(before, after, tolCm = 0.5) {
  const len = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
  const diff = Math.abs(len(before) - len(after));
  return { ok: diff <= tolCm, detail: `armhole length change ${diff.toFixed(2)} cm (tolerance ${tolCm})` };
}

export function frontBackSplitCheck(frontChange, backChange, sideChange, tol = 0.05) {
  // rule: front = 1/4 of side change, back = 1/2 of side change (uneven case)
  const okFront = Math.abs(frontChange - 0.25 * sideChange) <= tol;
  const okBack = Math.abs(backChange - 0.5 * sideChange) <= tol;
  return { ok: okFront && okBack, detail: `front ${frontChange.toFixed(2)} (want ${(0.25 * sideChange).toFixed(2)}), back ${backChange.toFixed(2)} (want ${(0.5 * sideChange).toFixed(2)})` };
}

export function targetsCheck(actual, targets, tolIn = 0.05) {
  const bad = Object.keys(targets).filter((k) => Math.abs(actual[k] - targets[k]) > tolIn);
  return { ok: bad.length === 0, detail: bad.length ? `off target: ${bad.join(', ')}` : 'all targets met' };
}
