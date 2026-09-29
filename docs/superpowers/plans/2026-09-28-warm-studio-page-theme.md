# Warm Studio Full-Page Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the hero's Warm Studio visual language through every portfolio section and remove mobile hero overlap.

**Architecture:** Add one page-level wrapper and one scoped theme stylesheet so legacy components retain their data and behavior while receiving consistent tokens, surfaces, typography, and responsive treatment. Repair the mobile hero in its existing stylesheet by moving copy into a reserved lower zone below the portrait instead of overlaying the face.

**Tech Stack:** React 17, CSS, Jest, React Testing Library, Create React App

---

### Task 1: Add the page theme boundary

**Files:**
- Create: `src/pages/Main/Main.test.js`
- Modify: `src/pages/Main/Main.js`
- Create: `src/pages/Main/WarmStudio.css`

- [ ] **Step 1: Write the failing page-wrapper test**

Create `src/pages/Main/Main.test.js` with mocked child sections and assert that the main page exposes the shared theme boundary:

```js
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Main from './Main';

jest.mock('../../components', () => ({
  Landing: () => <section>Landing</section>,
  About: () => <section>About</section>,
  Skills: () => <section>Skills</section>,
  Experience: () => <section>Experience</section>,
  Projects: () => <section>Projects</section>,
  Services: () => <section>Services</section>,
  Education: () => <section>Education</section>,
  Testimonials: () => <section>Testimonials</section>,
  Contacts: () => <section>Contacts</section>,
  Footer: () => <footer>Footer</footer>,
}));

test('wraps the portfolio in the Warm Studio theme boundary', () => {
  const { container } = render(<Main />);
  expect(container.firstChild).toHaveClass('warm-studio-page');
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
$env:CI='true'; npm test -- --watchAll=false --testMatch "**/src/**/*.test.js"
```

Expected: `Main.test.js` fails because the wrapper class is absent.

- [ ] **Step 3: Add the wrapper and stylesheet import**

Update `src/pages/Main/Main.js`:

```js
import './WarmStudio.css';

// ...
<div className='warm-studio-page'>
  {/* existing sections in their current order */}
</div>
```

Create `src/pages/Main/WarmStudio.css` with the page tokens:

```css
.warm-studio-page {
  --studio: #e4ded5;
  --studio-light: #eee8e1;
  --studio-deep: #d8cec2;
  --ink: #241f1b;
  --ink-muted: rgba(36, 31, 27, 0.72);
  --studio-border: rgba(36, 31, 27, 0.16);
  --studio-shadow: 0 18px 50px rgba(48, 39, 32, 0.08);
  background: var(--studio);
  color: var(--ink);
  overflow: hidden;
}
```

- [ ] **Step 4: Run tests and verify GREEN**

Run the Step 2 command. Expected: all React suites pass.

- [ ] **Step 5: Commit**

```powershell
git add -- src/pages/Main/Main.js src/pages/Main/Main.test.js src/pages/Main/WarmStudio.css
git commit -m "feat: add warm studio page boundary"
```

### Task 2: Apply the Continuous Editorial theme to every section

**Files:**
- Modify: `src/pages/Main/WarmStudio.css`

- [ ] **Step 1: Add scoped section surfaces and typography**

Extend `WarmStudio.css` so `.about`, `.skills`, `.experience`, `.projects`, `.services`, `.education`, `.testimonials`, `.contacts`, and `.footer` override inline legacy colors with warm surfaces. Use `!important` only where inline theme styles otherwise win.

```css
.warm-studio-page :is(.about,.skills,.experience,.projects,.services,.education,.testimonials,.contacts,.footer) {
  background: var(--studio) !important;
  color: var(--ink) !important;
}
.warm-studio-page :is(.skills,.projects,.education,.contacts) {
  background: rgba(255,255,255,.2) !important;
  border-block: 1px solid var(--studio-border);
}
.warm-studio-page :is(.about,.skills,.experience,.projects,.services,.education,.testimonials,.contacts) h1,
.warm-studio-page :is(.about,.skills,.experience,.projects,.services,.education,.testimonials,.contacts) h2 {
  color: var(--ink) !important;
  letter-spacing: -.035em;
}
```

- [ ] **Step 2: Restyle cards, controls, and form fields**

Add grouped selectors for skill boxes, timeline cards, projects, services, testimonials, contact fields, buttons, icons, and footer. Use translucent light surfaces, `1px` borders, `20–28px` radii, charcoal text, muted secondary text, and restrained shadows. Preserve component dimensions and interaction selectors.

- [ ] **Step 3: Add responsive containment**

At `max-width: 760px`, reduce section padding, ensure cards use available width, allow contact details and project controls to wrap, and prevent horizontal overflow.

- [ ] **Step 4: Run React tests**

Run:

```powershell
$env:CI='true'; npm test -- --watchAll=false --testMatch "**/src/**/*.test.js"
```

Expected: all suites pass.

- [ ] **Step 5: Commit**

```powershell
git add -- src/pages/Main/WarmStudio.css
git commit -m "feat: extend warm studio theme across portfolio"
```

### Task 3: Repair the mobile hero composition

**Files:**
- Modify: `src/components/Landing/Landing.css`

- [ ] **Step 1: Reproduce the overlap before editing**

Open the local site at a 390×844 viewport. Place the cursor outside the hero tracking area or use a coarse-pointer viewport. Confirm the signature overlaps the portrait near the lower face/shoulders.

- [ ] **Step 2: Replace the mobile absolute overlay with reserved zones**

Replace the existing `@media(max-width:760px)` block with a layout that reserves portrait and copy space:

```css
@media (max-width: 760px) {
  .cursor-hero {
    min-height: 100svh;
    padding: 0 1.25rem 2.5rem;
    display: grid;
    grid-template-rows: minmax(34rem, 64svh) auto;
    overflow: hidden;
  }
  .cursor-hero__nav { top: 1rem; width: calc(100% - 2rem); justify-content: center; }
  .cursor-hero__character { height: min(64svh, 36rem); transform: none; }
  .cursor-hero__character img,
  .cursor-hero__character canvas { object-position: 50% 20%; }
  .cursor-hero::after {
    background: linear-gradient(0deg, var(--studio) 0%, rgba(228,222,213,.98) 34%, rgba(228,222,213,0) 68%);
  }
  .cursor-hero__copy {
    position: relative;
    inset: auto;
    z-index: 3;
    align-self: end;
    width: 100%;
    padding-top: 1.25rem;
  }
  .cursor-hero__copy h1 { font-size: clamp(3.8rem, 18vw, 5.7rem); line-height: .78; }
  .cursor-hero__actions a { flex: 1 1 9rem; }
}
```

Adjust the portrait row or copy scale during visual QA if needed, without restoring absolute overlap.

- [ ] **Step 3: Add a narrow-phone refinement**

Add a `max-width: 380px` rule that reduces horizontal padding, navigation gaps, signature size, and button minimum width while keeping 44px minimum control height.

- [ ] **Step 4: Run React tests**

Run the test command from Task 2. Expected: all suites pass.

- [ ] **Step 5: Commit**

```powershell
git add -- src/components/Landing/Landing.css
git commit -m "fix: separate mobile hero portrait and copy"
```

### Task 4: Full local verification

**Files:**
- Verify only; do not modify unrelated warnings.

- [ ] **Step 1: Run extraction and React tests**

```powershell
& 'C:\Users\abhilashsandi\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m unittest scripts.test_extract_character_frames -v
$env:CI='true'; npm test -- --watchAll=false --testMatch "**/src/**/*.test.js"
```

Expected: 6 extraction tests and all React tests pass.

- [ ] **Step 2: Run the production build**

```powershell
Remove-Item Env:CI -ErrorAction SilentlyContinue
$env:NODE_OPTIONS='--openssl-legacy-provider'
npm run build
```

Expected: build and react-snap succeed. Existing unused-import and outdated Browserslist warnings may remain.

- [ ] **Step 3: Perform browser QA**

Verify the full page at desktop width and at 375×667 and 390×844. Confirm:

- Hero portrait, signature, biography, navigation, and actions do not overlap.
- Every downstream section uses cream/taupe surfaces and charcoal text.
- Cards and controls share border/radius/shadow treatment.
- No horizontal scrolling occurs.
- Cursor tracking still works on desktop; reduced-motion/coarse-pointer fallback remains intact.

- [ ] **Step 4: Request focused review**

Review the implementation against `docs/superpowers/specs/2026-09-28-warm-studio-page-theme-design.md`. Fix Critical and Important findings, rerun verification, and keep the development server running locally for user inspection.
