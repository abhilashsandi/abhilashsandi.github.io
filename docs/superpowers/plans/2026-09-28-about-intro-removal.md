# About Intro Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely remove the Dallas introduction sentence from About data and rendered markup while preserving the two approved professional paragraphs and responsive layout.

**Architecture:** Remove the obsolete data field at its source and remove its corresponding paragraph from the About component. Update focused tests first to establish RED, then make the minimal data/markup changes and verify responsive rendering, the full test suite, and the production build.

**Tech Stack:** React 16, Create React App/Jest, React Testing Library, CSS

---

## Task 1: Capture the removal in focused tests

**Files:**
- Modify: `src/data/aboutData.test.js`
- Modify: `src/components/About/About.test.js`

- [ ] Add `expect(aboutData).not.toHaveProperty('description1')` to the data test while preserving the exact approved `description2` and `description3` assertions and the `10+ years` regression guard.
- [ ] Rename the component test to describe the two-paragraph professional summary.
- [ ] Change the component assertions to require exactly two direct paragraphs under `.about-description`, with `13+ years` in the first and `production Generative AI features` in the second.
- [ ] Add an assertion that the rendered component does not contain `My name's Abhilash Sandi`.
- [ ] Run the focused tests and confirm they fail for the intended reasons: the obsolete field still exists and three paragraphs are still rendered.

```powershell
$env:CI='true'; npm test -- --watchAll=false --runInBand --testMatch "**/src/{data/aboutData,components/About/About}.test.js"
```

- [ ] Commit the failing regression tests.

```powershell
git add -- src/data/aboutData.test.js src/components/About/About.test.js
git commit -m "test: capture about intro removal"
```

## Task 2: Remove the obsolete data and markup

**Files:**
- Modify: `src/data/aboutData.js`
- Modify: `src/components/About/About.js`

- [ ] Delete the `description1` property from `aboutData` without changing `description2` or `description3`.
- [ ] Remove the paragraph that renders `aboutData.description1` from the About component.
- [ ] Leave the existing paragraph spacing CSS and all other layout and styling unchanged.
- [ ] Run the focused tests and confirm they pass.

```powershell
$env:CI='true'; npm test -- --watchAll=false --runInBand --testMatch "**/src/{data/aboutData,components/About/About}.test.js"
```

- [ ] Check the patch for whitespace errors.

```powershell
git diff --check
```

- [ ] Commit the implementation.

```powershell
git add -- src/data/aboutData.js src/components/About/About.js
git commit -m "feat: remove about introduction"
```

## Task 3: Verify the portfolio locally

**Files:**
- Verify: `src/data/aboutData.js`
- Verify: `src/components/About/About.js`
- Verify: `src/components/About/About.test.js`
- Verify: `src/data/aboutData.test.js`

- [ ] Inspect `/#about` at a 1440×900 desktop viewport and confirm the About section has exactly two professional-summary paragraphs, no removed introduction text, no overflow or collisions, and approximately 72px horizontal content padding.
- [ ] Inspect `/#about` at a 390×844 mobile viewport and confirm the same two paragraphs render cleanly, the removed introduction is absent, there is no horizontal overflow or overlap, mobile content padding remains approximately 39px, and Skills begins naturally after the About content.
- [ ] Run the complete React test suite.

```powershell
$env:CI='true'; npm test -- --watchAll=false --runInBand --testMatch "**/src/**/*.test.js"
```

- [ ] Run the production build using the compatibility flag required by this project's toolchain.

```powershell
$env:NODE_OPTIONS='--openssl-legacy-provider'; npm run build
```

- [ ] Confirm there are no whitespace errors or uncommitted changes. Do not push.

```powershell
git diff --check
git status --short
```
