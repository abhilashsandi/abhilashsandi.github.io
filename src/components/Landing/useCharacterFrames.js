import { useEffect, useState } from 'react';

export const FRAME_COUNT = 64;
export const CENTER_FRAME = '/character-frames/center.webp';

export default function useCharacterFrames(enabled) {
  const [state, setState] = useState({ frames: [], center: null, ready: false, failed: false });
  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    const paths = Array.from({ length: FRAME_COUNT }, (_, index) =>
      `/character-frames/frame-${String(index).padStart(2, '0')}.webp`
    );
    const load = (src) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
    Promise.all([load(CENTER_FRAME), ...paths.map(load)])
      .then(([center, ...frames]) => active && setState({ frames, center, ready: true, failed: false }))
      .catch(() => active && setState((current) => ({ ...current, failed: true })));
    return () => { active = false; };
  }, [enabled]);
  return state;
}
