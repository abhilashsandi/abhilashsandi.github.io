import {
  angleForPointer,
  frameForAngle,
  isInsideDeadZone,
  lerpAngle,
  shouldShowCanvas,
} from './landingAnimation';

test('angleForPointer returns the screen-space angle around the face', () => {
  expect(angleForPointer({ x: 20, y: 10 }, { x: 10, y: 10 })).toBeCloseTo(0);
  expect(angleForPointer({ x: 10, y: 20 }, { x: 10, y: 10 })).toBeCloseTo(
    Math.PI / 2
  );
});

test('lerpAngle crosses the circular seam by the shortest path', () => {
  const result = lerpAngle(Math.PI - 0.1, -Math.PI + 0.1, 0.5);
  expect(Math.abs(Math.abs(result) - Math.PI)).toBeLessThan(0.01);
});

test('frameForAngle aligns the up-first video sequence to cursor direction', () => {
  expect(frameForAngle(-Math.PI / 2, 64)).toBe(0);
  expect(frameForAngle(0, 64)).toBe(16);
  expect(frameForAngle(Math.PI / 2, 64)).toBe(32);
  expect(frameForAngle(Math.PI, 64)).toBe(48);
});

test('isInsideDeadZone uses the configured radius', () => {
  expect(isInsideDeadZone({ x: 11, y: 11 }, { x: 10, y: 10 }, 2)).toBe(true);
  expect(isInsideDeadZone({ x: 13, y: 13 }, { x: 10, y: 10 }, 2)).toBe(false);
});

test('shouldShowCanvas requires tracking, loaded frames, and canvas support', () => {
  expect(shouldShowCanvas(true, true, true)).toBe(true);
  expect(shouldShowCanvas(false, true, true)).toBe(false);
  expect(shouldShowCanvas(true, false, true)).toBe(false);
  expect(shouldShowCanvas(true, true, false)).toBe(false);
});
