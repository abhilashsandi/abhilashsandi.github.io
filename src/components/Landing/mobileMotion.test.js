import { angleForMotion, isMotionNeutral, motionVector } from './mobileMotion';

test('motionVector is relative to the first sensor reading', () => {
  expect(motionVector({ beta: 14, gamma: -2 }, { beta: 10, gamma: -8 }, 20))
    .toEqual({ x: 0.3, y: 0.2 });
});

test('motionVector clamps extreme tilt and rejects incomplete readings', () => {
  expect(motionVector({ beta: 80, gamma: -80 }, { beta: 0, gamma: 0 }, 20))
    .toEqual({ x: -1, y: 1 });
  expect(motionVector({ beta: null, gamma: 1 }, { beta: 0, gamma: 0 }, 20))
    .toBeNull();
});

test('motion helpers expose screen-space angle and neutral dead zone', () => {
  expect(angleForMotion({ x: 1, y: 0 })).toBeCloseTo(0);
  expect(angleForMotion({ x: 0, y: 1 })).toBeCloseTo(Math.PI / 2);
  expect(isMotionNeutral({ x: 0.05, y: 0.05 }, 0.12)).toBe(true);
  expect(isMotionNeutral({ x: 0.2, y: 0 }, 0.12)).toBe(false);
});
