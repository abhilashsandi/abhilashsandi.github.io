const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function motionVector(reading, baseline, maxTilt = 24) {
  const values = [reading?.beta, reading?.gamma, baseline?.beta, baseline?.gamma];
  if (!values.every(Number.isFinite) || maxTilt <= 0) return null;
  return {
    x: clamp((reading.gamma - baseline.gamma) / maxTilt, -1, 1),
    y: clamp((reading.beta - baseline.beta) / maxTilt, -1, 1),
  };
}

export const angleForMotion = ({ x, y }) => Math.atan2(y, x);

export const isMotionNeutral = ({ x, y }, radius) => Math.hypot(x, y) <= radius;
