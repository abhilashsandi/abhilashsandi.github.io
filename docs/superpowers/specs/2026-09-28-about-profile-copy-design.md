# About Profile Copy Design

## Goal

Refresh the About section to reflect 13+ years of experience and current full-stack and Generative AI expertise without making the portfolio copy feel like a dense résumé.

## Content Structure

Keep the existing introductory sentence and replace the long professional summary with two concise professional paragraphs:

> Senior Full Stack Software Engineer with 13+ years of experience designing and delivering end-to-end web applications across insurance, e-commerce and retail, banking, SaaS, and low-code platforms. I specialize in React, Next.js, Node.js, and TypeScript, building scalable front-end and back-end systems that deliver reliable, high-quality user experiences.
>
> My recent work includes production Generative AI features using OpenAI APIs, token streaming with SSE, RAG with pgvector, embeddings, semantic search, prompt engineering, and agentic workflows using MCP servers, Claude Code, and BMAD. I also bring hands-on expertise in REST and GraphQL APIs, microservices, OAuth2/JWT, PostgreSQL, MongoDB, Redis, cloud deployments, Docker, Kubernetes, RabbitMQ, and CI/CD—while leading teams and advancing AI-assisted development practices.

## Implementation

- Update `description2` in `src/data/aboutData.js` with the full-stack and industry summary.
- Add `description3` in `src/data/aboutData.js` for Generative AI and architecture expertise.
- Update `src/components/About/About.js` to render `description1`, `description2`, and `description3` as separate paragraphs.
- Add a scoped paragraph gap in `src/pages/Main/WarmStudio.css` without changing the section's outer spacing.
- Preserve the existing About heading, introductory sentence, illustration, outer layout, and section spacing.
- Do not change technology lists or experience records elsewhere on the site.

## Verification

- Add a focused data regression test that verifies “13+ years,” the four core technologies, and the production Generative AI/RAG keywords.
- Add a component regression test that verifies all three About paragraphs render independently.
- Render the About section at desktop and mobile widths to confirm the new copy wraps cleanly and does not overflow.
- Run the full React test suite and production build.
