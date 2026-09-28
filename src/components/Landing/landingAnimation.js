export const normalizeAngle = (angle) =>
  Math.atan2(Math.sin(angle), Math.cos(angle));

export const angleForPointer = (pointer, faceCenter) =>
  Math.atan2(pointer.y - faceCenter.y, pointer.x - faceCenter.x);

export const lerpAngle = (from, to, amount) =>
  normalizeAngle(from + normalizeAngle(to - from) * amount);

export const frameForAngle = (angle, frameCount) => {
  const clockwiseFromUp =
    (normalizeAngle(angle) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
  return Math.round((clockwiseFromUp / (Math.PI * 2)) * frameCount) % frameCount;
};

export const isInsideDeadZone = (pointer, faceCenter, radius) =>
  Math.hypot(pointer.x - faceCenter.x, pointer.y - faceCenter.y) <= radius;
