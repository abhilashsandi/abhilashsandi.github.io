# Balanced Section Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce excessive vertical whitespace across every non-hero portfolio section on desktop and mobile while preserving content, typography, touch targets, and the repaired hero layout.

**Architecture:** Centralize the page-density scale in `WarmStudio.css` with responsive custom properties, then use scoped theme overrides to neutralize duplicate component margins and minimum heights. Protect the values with a focused Jest regression test that reads the shipped stylesheet, and verify the rendered geometry in the local browser at three representative viewport sizes.

**Tech Stack:** React 16, Create React App/Jest, CSS custom properties, responsive media queries, local browser preview

---

## File Structure

- Create `src/pages/Main/WarmStudio.test.js` to lock the shared spacing scale and the critical internal-gap overrides.
- Modify `src/pages/Main/WarmStudio.css` to define and apply the balanced desktop/mobile spacing system.
- Do not modify `src/components/Landing/Landing.css`; the hero layout and its 48px eyebrow/signature separation remain unchanged.

### Task 1: Lock the balanced spacing contract

**Files:**
- Create: `src/pages/Main/WarmStudio.test.js`
- Test: `src/pages/Main/WarmStudio.test.js`

- [ ] **Step 1: Write the failing stylesheet regression test**

```js
const fs = require('fs')
const path = require('path')

const css = fs.readFileSync(path.join(__dirname, 'WarmStudio.css'), 'utf8')

describe('warm studio section spacing', () => {
  test('uses the balanced shared spacing scale', () => {
    expect(css).toMatch(/--section-space:\s*clamp\(3\.5rem,\s*5vw,\s*4\.5rem\)/)
    expect(css).toMatch(/padding-block:\s*var\(--section-space\)/)
    expect(css).toMatch(/@media \(max-width:\s*760px\)[\s\S]*--section-space:\s*clamp\(2\.25rem,\s*10vw,\s*2\.75rem\)/)
  })

  test('removes duplicate whitespace inside dense sections', () => {
    expect(css).toMatch(/\.warm-studio-page \.about-img\s*{[\s\S]*?margin-top:\s*0/)
    expect(css).toMatch(/\.warm-studio-page \.skillsContainer\s*{[\s\S]*?margin-top:\s*var\(--section-heading-gap\)/)
    expect(css).toMatch(/\.warm-studio-page \.testimonials\s*{[\s\S]*?min-height:\s*0/)
    expect(css).toMatch(/\.warm-studio-page \.contacts--container\s*{[\s\S]*?margin-top:\s*0/)
  })
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
$env:CI='true'; npm test -- --watchAll=false --runInBand src/pages/Main/WarmStudio.test.js
```

Expected: FAIL because the stylesheet still uses `clamp(4.5rem, 8vw, 8rem)`, mobile `4rem`, testimonial `44rem`, and does not contain the balanced custom properties.

- [ ] **Step 3: Commit the failing regression test**

```powershell
git add -- src/pages/Main/WarmStudio.test.js
git commit -m "test: capture balanced section spacing"
```

### Task 2: Apply the shared desktop and mobile spacing scale

**Files:**
- Modify: `src/pages/Main/WarmStudio.css`
- Test: `src/pages/Main/WarmStudio.test.js`

- [ ] **Step 1: Add shared spacing variables to `.warm-studio-page`**

Add these declarations alongside the existing theme variables:

```css
  --section-space: clamp(3.5rem, 5vw, 4.5rem);
  --section-heading-gap: clamp(1.5rem, 2.5vw, 2.5rem);
```

- [ ] **Step 2: Replace the oversized shared section padding**

Change the existing shared section rule to:

```css
.warm-studio-page :is(
  .about,
  .skills,
  .experience,
  .projects,
  .services,
  .education,
  .testimonials,
  .contacts
) {
  min-height: auto;
  padding-block: var(--section-space);
}
```

Remove the separate desktop `.about` padding override so every section follows one scale.

- [ ] **Step 3: Define the mobile scale inside the existing 760px media query**

Add:

```css
  .warm-studio-page {
    --section-space: clamp(2.25rem, 10vw, 2.75rem);
    --section-heading-gap: clamp(1.25rem, 6vw, 1.75rem);
  }
```

Remove the old mobile rule that sets every section to `padding-block: 4rem`.

- [ ] **Step 4: Run the focused test**

Run:

```powershell
$env:CI='true'; npm test -- --watchAll=false --runInBand src/pages/Main/WarmStudio.test.js
```

Expected: the shared-spacing test passes; the internal-spacing test still fails.

### Task 3: Remove duplicated internal gaps

**Files:**
- Modify: `src/pages/Main/WarmStudio.css`
- Test: `src/pages/Main/WarmStudio.test.js`

- [ ] **Step 1: Tighten About and Skills without changing content sizes**

Update and add the scoped overrides:

```css
.warm-studio-page .about-body {
  max-width: 1180px;
  margin: 0 auto;
  padding: clamp(1.75rem, 3vw, 2.75rem) clamp(1.5rem, 6vw, 6rem) 0;
  gap: clamp(1.5rem, 4vw, 4rem);
}

.warm-studio-page .about-img {
  margin-top: 0;
}

.warm-studio-page .skillsContainer {
  max-width: 1280px;
  margin-top: var(--section-heading-gap);
  padding-block: 0;
}

.warm-studio-page .marquee {
  padding-block: 1.5rem;
}

.warm-studio-page .skill--box {
  margin: 1rem;
}
```

- [ ] **Step 2: Tighten content-section heading and container gaps**

Add:

```css
.warm-studio-page :is(
  .experience-description,
  .education-description
) {
  padding-block: 0;
}

.warm-studio-page :is(
  .experience-description > h1,
  .education-description > h1,
  .projects--header h1,
  .services-header > h1
) {
  margin-bottom: var(--section-heading-gap);
}

.warm-studio-page .projects--bodyContainer {
  gap: clamp(2rem, 4vw, 3rem);
}

.warm-studio-page .services-body > p {
  margin-bottom: clamp(2rem, 4vw, 3rem);
}
```

- [ ] **Step 3: Let Testimonials and Contact size to their content**

Replace the testimonial minimum-height override and add contact overrides:

```css
.warm-studio-page .testimonials {
  height: auto;
  min-height: 0;
}

.warm-studio-page .contacts--container {
  width: min(100%, 1280px);
  margin: 0 auto;
  padding-block: 0;
}

.warm-studio-page .socialmedia-icons {
  margin-top: 2rem;
}
```

- [ ] **Step 4: Add the focused mobile overrides**

Inside `@media (max-width: 760px)`, add:

```css
  .warm-studio-page .about-body {
    padding-top: 1.75rem;
    gap: 0.75rem;
  }

  .warm-studio-page .about-description {
    padding-block: 0;
  }

  .warm-studio-page .skillsContainer {
    margin-top: var(--section-heading-gap);
  }

  .warm-studio-page .marquee {
    padding-block: 1rem;
  }

  .warm-studio-page .skill--box {
    margin: 0.8rem;
  }

  .warm-studio-page .projects--bodyContainer {
    gap: 1.5rem;
  }

  .warm-studio-page .projects--viewAll {
    margin-top: 2rem;
  }

  .warm-studio-page .services-body > p {
    margin-bottom: 2rem;
  }
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```powershell
$env:CI='true'; npm test -- --watchAll=false --runInBand src/pages/Main/WarmStudio.test.js
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit the implementation**

```powershell
git add -- src/pages/Main/WarmStudio.css
git commit -m "fix: tighten portfolio section spacing"
```

### Task 4: Verify rendered geometry and prevent regressions

**Files:**
- Verify: `src/pages/Main/WarmStudio.css`
- Verify: `src/components/Landing/Landing.css`

- [ ] **Step 1: Verify desktop geometry at 1440 × 900**

Open `http://localhost:3000/`, set the viewport to 1440 × 900, and inspect every direct child of `.warm-studio-page`.

Expected:

- Non-hero sections compute to 56–72px top and bottom padding.
- No horizontal overflow.
- About, Skills, and Experience follow one consistent rhythm.
- Testimonials and Contact no longer reserve unnecessary viewport-height space.

- [ ] **Step 2: Verify mobile geometry at 390 × 844**

Expected:

- Non-hero sections compute to 36–44px top and bottom padding.
- About’s decorative line, illustration, heading, and text remain separated.
- Skills-to-Experience transition is visibly shorter.
- No cards, text, or controls overlap.
- `document.documentElement.scrollWidth <= window.innerWidth`.

- [ ] **Step 3: Verify tall mobile geometry at 390 × 1080**

Expected:

- The same balanced spacing applies without viewport-height gaps.
- The hero keeps at least 32px below its action buttons.
- “HI, I’M” remains separated from the signature by 48px.

- [ ] **Step 4: Run the full React suite**

Run:

```powershell
$env:CI='true'; npm test -- --watchAll=false --runInBand
```

Expected: all React suites pass.

- [ ] **Step 5: Run the Python extraction suite**

Run:

```powershell
& 'C:\Users\abhilashsandi\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m unittest scripts.test_extract_character_frames -v
```

Expected: all six extraction tests pass.

- [ ] **Step 6: Run the production build**

Run:

```powershell
npm run build
```

Expected: build and snapshot generation complete successfully. Existing Browserslist, unused-symbol, and react-snap 404-title warnings may remain; no new errors are introduced.

- [ ] **Step 7: Check the final diff and commit any verification-driven correction**

```powershell
git diff --check
git status --short
```

If browser verification required a CSS correction, stage only `src/pages/Main/WarmStudio.css` and commit it with:

```powershell
git add -- src/pages/Main/WarmStudio.css
git commit -m "fix: refine responsive section rhythm"
```

Do not push.
