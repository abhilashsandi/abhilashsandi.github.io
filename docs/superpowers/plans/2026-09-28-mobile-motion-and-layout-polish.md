# Mobile Motion and Layout Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a compact wide desktop About section, a gap-free mobile hero, an open-eyed static portrait, and opt-in mobile tilt tracking with safe fallbacks.

**Architecture:** Pure functions in `mobileMotion.js` normalize sensor readings into the existing angle/frame system. `Landing` owns permission state, sensor listeners, and the decision to reveal the canvas; CSS makes the portrait participate in the mobile grid and widens the desktop About layout. The supplied PNG is copied unchanged into public assets and remains visible until motion is fully active.

**Tech Stack:** React 16, browser Device Orientation API, canvas, CSS media queries, Jest, React Testing Library.

---

### Task 1: Add test-driven tilt normalization

**Files:**
- Create: `src/components/Landing/mobileMotion.js`
- Create: `src/components/Landing/mobileMotion.test.js`

- [ ] **Step 1: Write failing tests for valid readings, baseline-relative values, clamping, and the neutral zone**

```js
import { angleForMotion, isMotionNeutral, motionVector } from './mobileMotion';

test('motionVector is relative to the first sensor reading', () => {
  expect(motionVector({ beta: 14, gamma: -2 }, { beta: 10, gamma: -8 }, 20))
    .toEqual({ x: 0.3, y: 0.2 });
});

test('motionVector clamps extreme tilt and rejects incomplete readings', () => {
  expect(motionVector({ beta: 80, gamma: -80 }, { beta: 0, gamma: 0 }, 20))
    .toEqual({ x: -1, y: 1 });
  expect(motionVector({ beta: null, gamma: 1 }, { beta: 0, gamma: 0 }, 20)).toBeNull();
});

test('motion helpers expose screen-space angle and neutral dead zone', () => {
  expect(angleForMotion({ x: 1, y: 0 })).toBeCloseTo(0);
  expect(angleForMotion({ x: 0, y: 1 })).toBeCloseTo(Math.PI / 2);
  expect(isMotionNeutral({ x: 0.05, y: 0.05 }, 0.12)).toBe(true);
  expect(isMotionNeutral({ x: 0.2, y: 0 }, 0.12)).toBe(false);
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run from a temporary non-dot-path copy if CRA's Windows Jest matcher resolves the worktree path incorrectly:

```powershell
npm test -- --watchAll=false --runInBand src/components/Landing/mobileMotion.test.js
```

Expected: FAIL because `./mobileMotion` does not exist.

- [ ] **Step 3: Implement the minimal pure helpers**

```js
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
```

- [ ] **Step 4: Run the new test and verify GREEN**

Run: `npm test -- --watchAll=false --runInBand src/components/Landing/mobileMotion.test.js`

Expected: 3 tests pass.

- [ ] **Step 5: Commit the helper and tests**

```powershell
git add -- src/components/Landing/mobileMotion.js src/components/Landing/mobileMotion.test.js
git commit -m "feat: add mobile tilt mapping"
```

### Task 2: Make the open-eyed image the safe neutral portrait

**Files:**
- Create: `public/character-assets/abhilash-open-eyed.png`
- Modify: `src/components/Landing/useCharacterFrames.js`
- Modify: `src/components/Landing/Landing.test.js`

- [ ] **Step 1: Extend the Landing test to require the new neutral asset**

Add this assertion to the static portrait test:

```js
expect(screen.getByRole('img', { name: /abhilash sandi/i }))
  .toHaveAttribute('src', '/character-assets/abhilash-open-eyed.png');
```

- [ ] **Step 2: Run the Landing test and verify RED**

Run: `npm test -- --watchAll=false --runInBand src/components/Landing/Landing.test.js`

Expected: FAIL because the image still uses `/character-frames/center.webp`.

- [ ] **Step 3: Copy the supplied image and change the exported neutral frame**

```powershell
Copy-Item -LiteralPath 'C:\Users\abhilashsandi\Downloads\download (1).png' -Destination 'public\character-assets\abhilash-open-eyed.png'
```

Change the constant to:

```js
export const CENTER_FRAME = '/character-assets/abhilash-open-eyed.png';
```

- [ ] **Step 4: Run the Landing test and verify GREEN**

Run: `npm test -- --watchAll=false --runInBand src/components/Landing/Landing.test.js`

Expected: the portrait assertion passes.

- [ ] **Step 5: Commit the neutral portrait**

```powershell
git add -- public/character-assets/abhilash-open-eyed.png src/components/Landing/useCharacterFrames.js src/components/Landing/Landing.test.js
git commit -m "feat: use open-eyed neutral portrait"
```

### Task 3: Add opt-in mobile motion permission and rendering

**Files:**
- Modify: `src/components/Landing/Landing.js`
- Modify: `src/components/Landing/Landing.test.js`
- Modify: `src/components/Landing/Landing.css`

- [ ] **Step 1: Add failing component tests for static-before-permission and permission denial**

Provide coarse-pointer and no-reduced-motion `matchMedia` values, mock `DeviceOrientationEvent.requestPermission`, and assert:

```js
expect(screen.getByRole('button', { name: /enable motion/i })).toBeInTheDocument();
expect(screen.getByRole('img', { name: /abhilash sandi/i })).toBeVisible();
expect(screen.getByLabelText(/animated portrait/i)).toHaveAttribute('aria-hidden', 'true');
```

After a mocked denied permission response:

```js
fireEvent.click(screen.getByRole('button', { name: /enable motion/i }));
await screen.findByRole('button', { name: /motion denied/i });
expect(screen.getByRole('img', { name: /abhilash sandi/i })).toBeVisible();
```

- [ ] **Step 2: Run Landing tests and verify RED**

Run: `npm test -- --watchAll=false --runInBand src/components/Landing/Landing.test.js`

Expected: FAIL because the motion control and permission state do not exist.

- [ ] **Step 3: Add the permission state machine and orientation listener**

In `Landing.js`, add states `idle`, `requesting`, `listening`, `active`, `denied`, and `unavailable`. The click handler must call `DeviceOrientationEvent.requestPermission()` only from the button event when that method exists. A successful response starts the listener; a denied response or thrown error keeps the static portrait and updates the button state.

The first finite `beta`/`gamma` event sets `motionBaselineRef`. Later events update `motionRef` with `motionVector`. The render loop uses `angleForMotion`, `isMotionNeutral`, `lerpAngle`, and `frameForAngle` when the state is active. Define canvas visibility as:

```js
const showCanvas = shouldShowCanvas(
  pointerTracking || motionState === 'active',
  ready,
  canvasSupported
);
```

Render the control only for coarse pointers without reduced-motion preference:

```jsx
{motionCandidate && (
  <button
    className='cursor-hero__motion'
    type='button'
    onClick={enableMotion}
    disabled={motionState !== 'idle'}
  >
    {motionLabel[motionState]}
  </button>
)}
```

- [ ] **Step 4: Style the motion control without obscuring the face or copy**

Add a small translucent pill positioned at the portrait's lower-right on mobile. Give it a visible focus state, a minimum 44px touch target, and muted disabled styling. Do not show it in desktop fine-pointer mode.

- [ ] **Step 5: Run all Landing tests and verify GREEN**

Run: `npm test -- --watchAll=false --runInBand src/components/Landing/Landing.test.js src/components/Landing/landingAnimation.test.js src/components/Landing/mobileMotion.test.js`

Expected: all hero tests pass.

- [ ] **Step 6: Commit mobile motion behavior**

```powershell
git add -- src/components/Landing/Landing.js src/components/Landing/Landing.css src/components/Landing/Landing.test.js
git commit -m "feat: add opt-in mobile head tracking"
```

### Task 4: Remove the mobile hero gap and overlap

**Files:**
- Modify: `src/components/Landing/Landing.css`

- [ ] **Step 1: Record the failing layout evidence**

At 390x844 and 390x1080, confirm that the character is absolutely positioned and that the copy's top is separated from the character's bottom by the stretched second row. Record `characterBottom`, `copyTop`, and `scrollWidth` from the browser DOM.

- [ ] **Step 2: Make the portrait participate in the mobile grid**

Within `@media(max-width:760px)`, use two content-sized rows, reset the character's absolute inset, and start the copy immediately after it:

```css
.cursor-hero { grid-template-rows:auto auto; }
.cursor-hero__character {
  position:relative;
  grid-row:1;
  inset:auto;
  width:calc(100% + 2.5rem);
  height:clamp(24rem,54svh,30rem);
  margin-inline:-1.25rem;
}
.cursor-hero__copy {
  grid-row:2;
  align-self:start;
  padding-top:0;
}
```

Adjust the 380px breakpoint's width/margins to match its `0.9rem` container padding. Keep the portrait `object-position` centered on the eyes.

- [ ] **Step 3: Verify both mobile sizes visually and geometrically**

At 390x844 and 390x1080, require:

- `copyTop - characterBottom` between 0 and 24px;
- `documentElement.scrollWidth <= innerWidth`;
- portrait, signature, biography, and buttons do not overlap;
- static portrait remains visible before permission.

- [ ] **Step 4: Commit the mobile layout fix**

```powershell
git add -- src/components/Landing/Landing.css
git commit -m "fix: remove mobile hero gap"
```

### Task 5: Widen and compact the desktop About section

**Files:**
- Modify: `src/pages/Main/WarmStudio.css`

- [ ] **Step 1: Record the current desktop text width and section height**

At a desktop viewport near 1920x1000, capture the computed `.about-description` width and `.about` height. Confirm the narrow flex allocation reproduces the excessive wrapping shown in the user's screenshot.

- [ ] **Step 2: Apply an explicit wide desktop grid**

Add a desktop-only override:

```css
@media (min-width: 993px) {
  .warm-studio-page .about {
    padding-block: clamp(3.5rem, 5vw, 5.5rem);
  }
  .warm-studio-page .about-body {
    display:grid;
    grid-template-columns:minmax(0, 1.8fr) minmax(240px, .65fr);
    max-width:1360px;
    padding-inline:clamp(2rem, 4vw, 4rem);
    gap:clamp(2.5rem, 5vw, 5rem);
  }
  .warm-studio-page .about-description {
    width:auto;
    max-width:52rem;
    flex:none;
  }
  .warm-studio-page .about-description > p {
    max-width:52rem;
  }
  .warm-studio-page .about-img > img {
    width:min(100%, 300px);
  }
}
```

- [ ] **Step 3: Verify desktop line count and responsive fallback**

At desktop width, confirm the first paragraph is no more than two lines and the long paragraph uses substantially fewer lines than before. At 992px and below, confirm the existing stacked layout still applies.

- [ ] **Step 4: Commit the About layout fix**

```powershell
git add -- src/pages/Main/WarmStudio.css
git commit -m "fix: widen desktop about content"
```

### Task 6: Correct contact-form contrast

**Files:**
- Modify: `src/pages/Main/WarmStudio.css`

- [ ] **Step 1: Record the conflicting computed colors**

At desktop and mobile widths, inspect a form label, the submit button paragraph, and the send icon. Confirm the label keeps the legacy dark background and the broad `.contacts p` override wins over the button's intended white foreground.

- [ ] **Step 2: Add scoped warm-studio contrast overrides**

```css
.warm-studio-page .contacts label {
  background:var(--studio-light) !important;
  color:var(--ink) !important;
}
.warm-studio-page .submit-btn button,
.warm-studio-page .submit-btn button :is(p, svg) {
  background:var(--ink) !important;
  color:#fff !important;
}
```

- [ ] **Step 3: Verify desktop and mobile form appearance**

Confirm cream label chips with black text, a black button with visible white `Send` text and icon, visible focus styling, and no change to input or textarea dimensions.

- [ ] **Step 4: Commit the contrast fix**

```powershell
git add -- src/pages/Main/WarmStudio.css
git commit -m "fix: restore contact form contrast"
```

### Task 7: Full local verification

**Files:**
- Verify only; modify only if a test exposes a scoped defect.

- [ ] **Step 1: Run all JavaScript tests**

Run: `npm test -- --watchAll=false --runInBand`

Expected: every suite passes. If CRA cannot discover tests from the `.codex` worktree path, copy the checkout without `node_modules`, `build`, or `.git` to a temporary non-dot directory, junction its `node_modules` to this checkout, and run the same command there.

- [ ] **Step 2: Run the extraction tests**

Run:

```powershell
& 'C:\Users\abhilashsandi\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m unittest scripts.test_extract_character_frames -v
```

Expected: 6 tests pass.

- [ ] **Step 3: Produce a production build**

Run:

```powershell
$env:NODE_OPTIONS='--openssl-legacy-provider'
$env:CI=''
npm run build
```

Expected: optimized build and react-snap complete; only known legacy unused-import and Browserslist warnings remain.

- [ ] **Step 4: Perform final browser QA**

Verify desktop hero, desktop About, desktop contact form, 390x844 mobile hero/contact form, and 390x1080 mobile hero. Confirm no gap/overlap, no horizontal overflow, the open-eyed static portrait before permission, readable contact labels/button contents, and graceful denied/unavailable motion states. Physical tilt must be verified on an HTTPS-served sensor-equipped phone after deployment; desktop emulation verifies the permission state machine but cannot prove hardware readings.

- [ ] **Step 5: Review the diff and preserve local-only status**

Run:

```powershell
git diff --check
git status --short
git log -8 --oneline
```

Expected: clean worktree with local commits only. Do not push.

### Task 8: Remove the tall-mobile overlap and trailing whitespace regression

**Files:**
- Modify: `src/components/Landing/Landing.css`

- [ ] **Step 1: Capture the failing browser geometry at 390×1080**

Read the bounding rectangles for `.cursor-hero__character`, `.cursor-hero__copy`, `.cursor-hero__actions`, `.cursor-hero`, and `.about`.

Expected before the fix:

```text
copyPaddingTop = 0px
hero min-height = 1080px
aboutTop - actionsBottom = 327px (approximately)
```

- [ ] **Step 2: Apply the content-sized mobile hero and script safety inset**

Within `@media(max-width:760px)`, change the hero and copy declarations to:

```css
.cursor-hero {
  min-height:0;
  padding-bottom:2rem;
}
.cursor-hero__copy {
  padding-top:1.25rem;
}
```

Keep the existing content-sized grid rows, `align-content:start`, and portrait sizing unchanged.

- [ ] **Step 3: Re-run geometry checks at 390×844 and 390×1080**

Require:

```text
copy padding-top = 20px
aboutTop - actionsBottom <= 40px
documentElement.scrollWidth <= innerWidth
```

Visually confirm that animated portrait frames, the eyebrow, and the signature no longer overlap and that About follows the hero without a viewport-sized empty region.

- [ ] **Step 4: Run the full test and build suite**

Run:

```powershell
npm test -- --watchAll=false --runInBand
& 'C:\Users\abhilashsandi\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m unittest scripts.test_extract_character_frames -v
$env:NODE_OPTIONS='--openssl-legacy-provider'
$env:CI=''
npm run build
```

Expected: 12 React tests pass, 6 extraction tests pass, and the optimized production build completes with only the documented legacy warnings.

- [ ] **Step 5: Commit locally and do not push**

```powershell
git add -- src/components/Landing/Landing.css
git commit -m "fix: compact tall mobile hero"
```

### Task 9: Separate the mobile eyebrow from the script signature

**Files:**
- Modify: `src/components/Landing/Landing.css`

- [ ] **Step 1: Capture the failing line-box geometry at 390×844**

Measure `.cursor-hero__eyebrow` and `.cursor-hero__copy h1`.

Expected before the fix:

```text
eyebrow margin-bottom = 7.2px
heading box gap = approximately 7.2px
```

The script font's upper flourish extends roughly 40px above its measured heading box, so this line-box gap visibly collides with the eyebrow.

- [ ] **Step 2: Reserve sufficient flourish space**

Within `@media(max-width:760px)`, change the eyebrow declaration to:

```css
.cursor-hero__eyebrow {
  margin-bottom:3rem;
}
```

Do not reduce the signature font size or change the portrait/copy and hero/About gaps.

- [ ] **Step 3: Verify mobile geometry and appearance**

At 390×844 and 390×1080, require:

```text
eyebrow margin-bottom = 48px
heading box gap = approximately 48px
portrait-to-eyebrow buffer = 20px
About top - action buttons bottom = 32px
documentElement.scrollWidth <= innerWidth
```

Visually confirm that `HI, I'M` and `Abhilash Sandi` no longer touch or overlap.

- [ ] **Step 4: Run the full test and build suite**

Run the 12 React tests, 6 extraction tests, and optimized production build using the commands in Task 8 Step 4.

- [ ] **Step 5: Commit locally and do not push**

```powershell
git add -- src/components/Landing/Landing.css
git commit -m "fix: separate mobile hero eyebrow"
```
