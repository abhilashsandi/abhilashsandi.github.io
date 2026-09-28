# About Profile Copy Design

## Goal

Refresh the About section to reflect 13+ years of experience and current full-stack and Generative AI expertise without making the portfolio copy feel like a dense résumé.

## Content Structure

Keep the existing introductory sentence and replace the long professional summary with two concise paragraphs rendered through the existing About component:

> Senior Full Stack Software Engineer with 13+ years of experience designing and delivering end-to-end web applications across insurance, e-commerce and retail, banking, SaaS, and low-code platforms. I specialize in React, Next.js, Node.js, and TypeScript, building scalable front-end and back-end systems that deliver reliable, high-quality user experiences.
>
> My recent work includes production Generative AI features using OpenAI APIs, token streaming with SSE, RAG with pgvector, embeddings, semantic search, prompt engineering, and agentic workflows using MCP servers, Claude Code, and BMAD. I also bring hands-on expertise in REST and GraphQL APIs, microservices, OAuth2/JWT, PostgreSQL, MongoDB, Redis, cloud deployments, Docker, Kubernetes, RabbitMQ, and CI/CD—while leading teams and advancing AI-assisted development practices.

## Implementation Boundary

- Update only `description2` in `src/data/aboutData.js`.
- Preserve the existing About heading, introductory sentence, illustration, layout, and spacing.
- Preserve the existing line break between `description1` and `description2`.
- Do not change technology lists or experience records elsewhere on the site.

## Verification

- Add a focused data regression test that verifies “13+ years,” the four core technologies, and the production Generative AI/RAG keywords.
- Render the About section at desktop and mobile widths to confirm the new copy wraps cleanly and does not overflow.
- Run the full React test suite and production build.
