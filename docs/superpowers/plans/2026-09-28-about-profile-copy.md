# About Profile Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the outdated 10+ year About summary with approved concise copy describing 13+ years of full-stack, Generative AI, architecture, cloud, and engineering-leadership experience.

**Architecture:** Keep content in `aboutData.js`, split the approved professional summary across `description2` and a new `description3`, and let the About component render each description as a semantic paragraph. Add one scoped CSS rule for paragraph rhythm without changing the section’s established outer spacing.

**Tech Stack:** React 16, Create React App/Jest, React Testing Library, CSS

---

## File Structure

- Create `src/data/aboutData.test.js` for content regression coverage.
- Create `src/components/About/About.test.js` for semantic paragraph rendering coverage.
- Modify `src/data/aboutData.js` with the approved copy.
- Modify `src/components/About/About.js` to render three separate paragraphs.
- Modify `src/pages/Main/WarmStudio.css` to add a scoped gap between About paragraphs.

### Task 1: Lock the approved About content and paragraph structure

**Files:**
- Create: `src/data/aboutData.test.js`
- Create: `src/components/About/About.test.js`
- Test: `src/data/aboutData.test.js`
- Test: `src/components/About/About.test.js`

- [ ] **Step 1: Write the failing data regression test**

```js
import { aboutData } from './aboutData'

test('describes 13+ years of full-stack and production GenAI experience', () => {
  const profile = `${aboutData.description2 || ''} ${aboutData.description3 || ''}`

  expect(profile).toContain('13+ years')
  expect(profile).not.toContain('10+ years')
  ;['React', 'Next.js', 'Node.js', 'TypeScript'].forEach((technology) => {
    expect(profile).toContain(technology)
  })
  expect(profile).toContain('Generative AI')
  expect(profile).toContain('RAG with pgvector')
  expect(profile).toContain('MCP servers')
  expect(profile).toContain('AI-assisted development practices')
})
```

- [ ] **Step 2: Write the failing component regression test**

```js
import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import About from './About'
import ThemeContextProvider from '../../contexts/ThemeContext'

test('renders the introduction and professional summary as separate paragraphs', () => {
  const { container } = render(
    <ThemeContextProvider>
      <About />
    </ThemeContextProvider>
  )

  const paragraphs = container.querySelectorAll('.about-description > p')
  expect(paragraphs).toHaveLength(3)
  expect(paragraphs[0]).toHaveTextContent("My name's Abhilash Sandi")
  expect(paragraphs[1]).toHaveTextContent('13+ years')
  expect(paragraphs[2]).toHaveTextContent('production Generative AI features')
})
```

- [ ] **Step 3: Run both tests and verify RED**

Run:

```powershell
$env:CI='true'; npm test -- --watchAll=false --runInBand --testMatch "**/src/{data/aboutData,components/About/About}.test.js"
```

Expected: the data test fails because the old copy says 10+ years and has no `description3`; the component test fails because About renders one paragraph.

### Task 2: Add the approved copy and semantic paragraphs

**Files:**
- Modify: `src/data/aboutData.js`
- Modify: `src/components/About/About.js`
- Modify: `src/pages/Main/WarmStudio.css`
- Test: `src/data/aboutData.test.js`
- Test: `src/components/About/About.test.js`

- [ ] **Step 1: Replace the professional summary in `aboutData.js`**

Use these exact values:

```js
description2: `Senior Full Stack Software Engineer with 13+ years of experience designing and delivering end-to-end web applications across insurance, e-commerce and retail, banking, SaaS, and low-code platforms. I specialize in React, Next.js, Node.js, and TypeScript, building scalable front-end and back-end systems that deliver reliable, high-quality user experiences.`,
description3: `My recent work includes production Generative AI features using OpenAI APIs, token streaming with SSE, RAG with pgvector, embeddings, semantic search, prompt engineering, and agentic workflows using MCP servers, Claude Code, and BMAD. I also bring hands-on expertise in REST and GraphQL APIs, microservices, OAuth2/JWT, PostgreSQL, MongoDB, Redis, cloud deployments, Docker, Kubernetes, RabbitMQ, and CI/CD—while leading teams and advancing AI-assisted development practices.`,
```

- [ ] **Step 2: Render each description as its own paragraph in `About.js`**

Replace the current single paragraph with:

```jsx
<p style={{color: theme.tertiary80}}>{aboutData.description1}</p>
<p style={{color: theme.tertiary80}}>{aboutData.description2}</p>
<p style={{color: theme.tertiary80}}>{aboutData.description3}</p>
```

- [ ] **Step 3: Add scoped paragraph rhythm to `WarmStudio.css`**

Add immediately after the existing `.about-description > p` rule:

```css
.warm-studio-page .about-description > p + p {
  margin-top: 1rem;
}
```

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run:

```powershell
$env:CI='true'; npm test -- --watchAll=false --runInBand --testMatch "**/src/{data/aboutData,components/About/About}.test.js"
```

Expected: 2 suites and 2 tests pass.

- [ ] **Step 5: Commit the tested copy update**

```powershell
git add -- src/data/aboutData.js src/data/aboutData.test.js src/components/About/About.js src/components/About/About.test.js src/pages/Main/WarmStudio.css
git commit -m "feat: refresh about profile copy"
```

### Task 3: Verify responsive rendering and the production build

**Files:**
- Verify: `src/data/aboutData.js`
- Verify: `src/components/About/About.js`
- Verify: `src/pages/Main/WarmStudio.css`

- [ ] **Step 1: Verify desktop rendering at 1440 × 900**

Open `http://localhost:3000/#about` and confirm:

- The intro and two professional summaries render as three distinct paragraphs.
- The About text column does not overflow or collide with the illustration.
- The section keeps the balanced 72px outer padding.

- [ ] **Step 2: Verify mobile rendering at 390 × 844**

Confirm:

- All three paragraphs wrap within the viewport.
- No horizontal overflow is present.
- The illustration, heading, and copy remain separated.
- The next Skills section begins immediately after the About content and balanced section padding.

- [ ] **Step 3: Run the full React suite**

Run:

```powershell
$env:CI='true'; npm test -- --watchAll=false --runInBand --testMatch "**/src/**/*.test.js"
```

Expected: all React suites pass.

- [ ] **Step 4: Run the production build**

Run:

```powershell
$env:NODE_OPTIONS='--openssl-legacy-provider'; npm run build
```

Expected: build and react-snap complete successfully. Existing Browserslist, unused-import, and 404-title warnings may remain; no new error is introduced.

- [ ] **Step 5: Check repository state**

Run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors and no uncommitted tracked changes. Do not push.
