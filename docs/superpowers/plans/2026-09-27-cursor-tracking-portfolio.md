# Cursor-Tracking Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current split-screen landing section with a responsive Warm Studio hero whose 3D male character tracks the pointer using pre-extracted WebP frames.

**Architecture:** A repeatable Python/OpenCV script extracts 64 circular-direction frames and a centered fallback from the supplied MP4. Pure JavaScript helpers own angle math; a focused React hook preloads frame assets; the existing `Landing` component renders one frame at a time to canvas and falls back to the center portrait for reduced motion, coarse pointers, or load failure.

**Tech Stack:** React 16, Create React App 4, Jest, React Testing Library, CSS, Python 3, OpenCV, WebP.

---

## File Map

- Create `scripts/extract_character_frames.py`: inspect the source MP4 and extract 64 ordered WebP frames plus `center.webp`.
- Create `src/components/Landing/landingAnimation.js`: pure angle, dead-zone, and frame-index helpers.
- Create `src/components/Landing/landingAnimation.test.js`: unit coverage for the tracking math.
- Create `src/components/Landing/useCharacterFrames.js`: preload frames and expose ready/fallback state.
- Create `src/components/Landing/Landing.test.js`: component coverage for hero content and fallback behavior.
- Modify `src/components/Landing/Landing.js`: replace the old split hero with the canvas-based Warm Studio hero.
- Modify `src/components/Landing/Landing.css`: responsive layout, navigation pill, buttons, and custom cursor styling.
- Modify `src/pages/Main/Main.js`: remove the separate legacy navbar because navigation moves into the hero.
- Create `public/character-frames/frame-00.webp` through `frame-63.webp` and `center.webp`: generated runtime assets.
- Preserve `public/character-assets/abhilash-character-master.png`: source/fallback character artwork.

### Task 1: Validate and Extract Character Frames

**Files:**
- Create: `scripts/extract_character_frames.py`
- Create: `public/character-frames/frame-00.webp` through `frame-63.webp`
- Create: `public/character-frames/center.webp`

- [ ] **Step 1: Install the extraction dependency**

Run:

```powershell
C:\Users\abhilashsandi\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m pip install opencv-python-headless
```

Expected: installation completes and `python -c "import cv2"` exits with status 0.

- [ ] **Step 2: Add the extraction script**

```python
from pathlib import Path
import argparse
import cv2


def evenly_spaced_indices(frame_count: int, output_count: int) -> list[int]:
    if frame_count < output_count:
        raise ValueError("video has fewer frames than requested outputs")
    return [round(i * (frame_count - 1) / (output_count - 1)) for i in range(output_count)]


def extract(source: Path, destination: Path, output_count: int = 64) -> None:
    capture = cv2.VideoCapture(str(source))
    if not capture.isOpened():
        raise RuntimeError(f"unable to open {source}")
    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = capture.get(cv2.CAP_PROP_FPS)
    width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    if frame_count <= 0 or fps <= 0 or width <= 0 or height <= 0:
        raise RuntimeError("video metadata is incomplete")
    destination.mkdir(parents=True, exist_ok=True)
    indices = evenly_spaced_indices(frame_count, output_count)
    for output_index, source_index in enumerate(indices):
        capture.set(cv2.CAP_PROP_POS_FRAMES, source_index)
        ok, frame = capture.read()
        if not ok:
            raise RuntimeError(f"unable to read source frame {source_index}")
        output = destination / f"frame-{output_index:02d}.webp"
        if not cv2.imwrite(str(output), frame, [cv2.IMWRITE_WEBP_QUALITY, 88]):
            raise RuntimeError(f"unable to write {output}")
    capture.set(cv2.CAP_PROP_POS_FRAMES, frame_count - 1)
    ok, center = capture.read()
    capture.release()
    if not ok or not cv2.imwrite(str(destination / "center.webp"), center, [cv2.IMWRITE_WEBP_QUALITY, 92]):
        raise RuntimeError("unable to write center.webp")
    print(f"{width}x{height} | {fps:.3f} fps | {frame_count} frames")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--count", type=int, default=64)
    args = parser.parse_args()
    extract(args.source, args.destination, args.count)
```

- [ ] **Step 3: Run extraction and verify all assets**

Run:

```powershell
C:\Users\abhilashsandi\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\extract_character_frames.py C:\Users\abhilashsandi\Downloads\Man_tracking_head_animation_1080p_20260927215821.mp4 public\character-frames
Get-ChildItem public\character-frames\*.webp | Measure-Object
```

Expected: script prints valid video metadata and the count is `65`.

- [ ] **Step 4: Visually inspect a contact sheet**

Render frames `00`, `08`, `16`, `24`, `32`, `40`, `48`, `56`, and `center` into a 3x3 contact sheet and confirm that identity, clothing, background, and directional movement remain stable.

- [ ] **Step 5: Commit the extraction pipeline and assets**

```powershell
git add scripts/extract_character_frames.py public/character-frames public/character-assets/abhilash-character-master.png
git commit -m "feat: add cursor character frame assets"
```

### Task 2: Implement Tested Tracking Math

**Files:**
- Create: `src/components/Landing/landingAnimation.js`
- Create: `src/components/Landing/landingAnimation.test.js`

- [ ] **Step 1: Write failing unit tests**

```javascript
import { angleForPointer, frameForAngle, isInsideDeadZone, lerpAngle } from './landingAnimation';

test('angleForPointer returns the compass angle around the face', () => {
  expect(angleForPointer({ x: 20, y: 10 }, { x: 10, y: 10 })).toBeCloseTo(0);
  expect(angleForPointer({ x: 10, y: 20 }, { x: 10, y: 10 })).toBeCloseTo(Math.PI / 2);
});

test('lerpAngle crosses the circular seam by the shortest path', () => {
  const result = lerpAngle(Math.PI - 0.1, -Math.PI + 0.1, 0.5);
  expect(Math.abs(Math.abs(result) - Math.PI)).toBeLessThan(0.01);
});

test('frameForAngle wraps to a valid 64-frame index', () => {
  expect(frameForAngle(0, 64)).toBe(0);
  expect(frameForAngle(Math.PI, 64)).toBe(32);
  expect(frameForAngle(-Math.PI / 2, 64)).toBe(48);
});

test('isInsideDeadZone uses the configured radius', () => {
  expect(isInsideDeadZone({ x: 11, y: 11 }, { x: 10, y: 10 }, 2)).toBe(true);
  expect(isInsideDeadZone({ x: 13, y: 13 }, { x: 10, y: 10 }, 2)).toBe(false);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- --watchAll=false landingAnimation.test.js`

Expected: FAIL because `landingAnimation.js` does not exist.

- [ ] **Step 3: Implement the pure helpers**

```javascript
export const normalizeAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));

export const angleForPointer = (pointer, faceCenter) =>
  Math.atan2(pointer.y - faceCenter.y, pointer.x - faceCenter.x);

export const lerpAngle = (from, to, amount) =>
  normalizeAngle(from + normalizeAngle(to - from) * amount);

export const frameForAngle = (angle, frameCount) => {
  const normalized = (normalizeAngle(angle) + Math.PI * 2) % (Math.PI * 2);
  return Math.round((normalized / (Math.PI * 2)) * frameCount) % frameCount;
};

export const isInsideDeadZone = (pointer, faceCenter, radius) =>
  Math.hypot(pointer.x - faceCenter.x, pointer.y - faceCenter.y) <= radius;
```

- [ ] **Step 4: Run the unit test and verify success**

Run: `npm test -- --watchAll=false landingAnimation.test.js`

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit the math**

```powershell
git add src/components/Landing/landingAnimation.js src/components/Landing/landingAnimation.test.js
git commit -m "test: cover cursor tracking math"
```

### Task 3: Add Frame Preloading and Fallback State

**Files:**
- Create: `src/components/Landing/useCharacterFrames.js`
- Create: `src/components/Landing/Landing.test.js`

- [ ] **Step 1: Write a failing fallback rendering test**

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import Landing from './Landing';

test('renders identity, actions, and the accessible fallback portrait', () => {
  render(<Landing />);
  expect(screen.getByRole('heading', { name: /abhilash sandi/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /resume/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /let's talk/i })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /abhilash sandi/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the component test and verify failure**

Run: `npm test -- --watchAll=false Landing.test.js`

Expected: FAIL because the existing hero does not expose the approved content and fallback structure.

- [ ] **Step 3: Add the preload hook**

```javascript
import { useEffect, useState } from 'react';

export const FRAME_COUNT = 64;
export const CENTER_FRAME = '/character-frames/center.webp';

export default function useCharacterFrames(enabled) {
  const [state, setState] = useState({ frames: [], center: null, ready: false, failed: false });
  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    const paths = Array.from({ length: FRAME_COUNT }, (_, i) => `/character-frames/frame-${String(i).padStart(2, '0')}.webp`);
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
```

- [ ] **Step 4: Run the focused tests**

Run: `npm test -- --watchAll=false landingAnimation.test.js Landing.test.js`

Expected: the math tests pass; the component test remains failing until Task 4 supplies the markup.

- [ ] **Step 5: Commit the hook and pending component test**

```powershell
git add src/components/Landing/useCharacterFrames.js src/components/Landing/Landing.test.js
git commit -m "test: define cursor hero fallback behavior"
```

### Task 4: Build the Warm Studio Cursor Hero

**Files:**
- Modify: `src/components/Landing/Landing.js`
- Modify: `src/components/Landing/Landing.css`
- Modify: `src/pages/Main/Main.js`

- [ ] **Step 1: Replace the landing component**

Implement `Landing` with these exact responsibilities:

```javascript
const TRACKING = { smoothing: 0.26, deadZoneRatio: 0.12 };

// Render semantic nav, heading, bio, Resume, and Let's Talk outside canvas.
// Detect `(pointer: fine)` and `(prefers-reduced-motion: no-preference)`.
// Use useCharacterFrames only when both conditions pass.
// Draw the center frame until loading completes.
// In requestAnimationFrame, calculate the pointer angle around the measured
// face center, apply lerpAngle, choose center or frameForAngle, clear the
// canvas, and draw exactly one image with globalAlpha kept at 1.
// Remove pointer listeners, media-query listeners, resize listeners, and the
// animation frame in the effect cleanup.
```

The markup must include:

```jsx
<section className="cursor-hero" aria-labelledby="hero-title">
  <nav className="cursor-hero__nav" aria-label="Primary navigation">
    <NavLink to="/#projects" smooth>Work</NavLink>
    <NavLink to="/#about" smooth>About</NavLink>
    <NavLink to="/#contacts" smooth>Contact</NavLink>
  </nav>
  <div className="cursor-hero__copy">
    <p className="cursor-hero__eyebrow">Hi, I'm</p>
    <h1 id="hero-title">{headerData.name}</h1>
    <p>{headerData.desciption}</p>
    <div className="cursor-hero__actions">
      <a href={headerData.resumePdf} download="Abhilash_Sandi_Resume">Resume <span aria-hidden="true">→</span></a>
      <NavLink to="/#contacts" smooth>Let's Talk</NavLink>
    </div>
  </div>
  <div className="cursor-hero__character">
    <canvas aria-label="Animated portrait of Abhilash Sandi following the pointer" />
    <img src="/character-frames/center.webp" alt="Abhilash Sandi" />
  </div>
  <div className="cursor-hero__cursor" aria-hidden="true" />
</section>
```

- [ ] **Step 2: Add the responsive Warm Studio styles**

Use these design tokens and required behaviors in `Landing.css`:

```css
.cursor-hero {
  --studio: #e4ded5;
  --ink: #241f1b;
  --glass: rgba(255, 255, 255, 0.46);
  min-height: 100svh;
  position: relative;
  overflow: hidden;
  background: var(--studio);
  color: var(--ink);
}
.cursor-hero__nav { position: absolute; top: 1.5rem; left: 50%; transform: translateX(-50%); z-index: 3; display: flex; gap: 1.5rem; padding: .85rem 1.4rem; border: 1px solid rgba(36,31,27,.2); border-radius: 999px; background: var(--glass); backdrop-filter: blur(20px); }
.cursor-hero__copy { position: absolute; z-index: 2; left: clamp(1.5rem,7vw,7rem); bottom: clamp(2rem,8vh,6rem); width: min(34rem,42vw); }
.cursor-hero__copy h1 { font-family: 'BestermindRegular', cursive; font-size: clamp(4rem,9vw,8.5rem); font-weight: 400; line-height: .8; }
.cursor-hero__character { position: absolute; inset: 0; }
.cursor-hero__character canvas, .cursor-hero__character img { width: 100%; height: 100%; object-fit: cover; }
.cursor-hero__cursor { pointer-events: none; position: fixed; z-index: 999; width: 12px; height: 12px; border: 1px solid #fff; border-radius: 50%; box-shadow: 0 0 26px rgba(255,255,255,.85); }
@media (pointer: coarse), (prefers-reduced-motion: reduce) { .cursor-hero__cursor { display: none; } }
@media (max-width: 760px) { .cursor-hero__copy { width: auto; right: 1.5rem; bottom: 2rem; } .cursor-hero__character { height: 68%; } .cursor-hero__copy h1 { font-size: clamp(3.4rem,18vw,5.5rem); } }
```

Add the remaining spacing, button, focus-visible, loading, and layering declarations needed to match the approved mockup without changing other sections.

- [ ] **Step 3: Remove the separate navbar from the main page**

Change `Main.js` to stop importing/rendering `Navbar`; retain all existing content sections and their order.

- [ ] **Step 4: Run the component and math tests**

Run: `npm test -- --watchAll=false landingAnimation.test.js Landing.test.js`

Expected: PASS.

- [ ] **Step 5: Commit the hero**

```powershell
git add src/components/Landing src/pages/Main/Main.js
git commit -m "feat: build cursor-tracking portfolio hero"
```

### Task 5: Production and Visual Verification

**Files:**
- Modify only files required by defects found during verification.

- [ ] **Step 1: Run all tests**

Run: `npm test -- --watchAll=false`

Expected: PASS with no failed suites.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: `Compiled successfully` and successful prerendering.

- [ ] **Step 3: Inspect the production site**

Run: `npx serve -s build` and inspect the site at desktop, tablet, and mobile viewport sizes. Confirm the navigation anchors, Resume download, Let's Talk link, image/canvas layering, centered fallback, pointer response, and existing sections.

- [ ] **Step 4: Verify accessibility and fallback states**

Confirm keyboard-only navigation and focus visibility. Emulate `prefers-reduced-motion: reduce` and a coarse pointer; both must display the centered still portrait with no custom cursor or animation loop.

- [ ] **Step 5: Check repository hygiene**

Run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors; only the user's pre-existing `package.json` change and intentional task files appear.

- [ ] **Step 6: Record the verification result**

If Step 3 or Step 4 required a correction, rerun Steps 1-5 after making it and include the corrected file in the Task 4 hero commit. If no correction was required, make no additional commit.
