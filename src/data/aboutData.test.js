import { aboutData } from './aboutData'

test('matches the approved full-stack and production GenAI profile copy', () => {
  expect(aboutData.description2).toBe(
    'Senior Full Stack Software Engineer with 13+ years of experience designing and delivering end-to-end web applications across insurance, e-commerce and retail, banking, SaaS, and low-code platforms. I specialize in React, Next.js, Node.js, and TypeScript, building scalable front-end and back-end systems that deliver reliable, high-quality user experiences.'
  )
  expect(aboutData.description3).toBe(
    'My recent work includes production Generative AI features using OpenAI APIs, token streaming with SSE, RAG with pgvector, embeddings, semantic search, prompt engineering, and agentic workflows using MCP servers, Claude Code, and BMAD. I also bring hands-on expertise in REST and GraphQL APIs, microservices, OAuth2/JWT, PostgreSQL, MongoDB, Redis, cloud deployments, Docker, Kubernetes, RabbitMQ, and CI/CD—while leading teams and advancing AI-assisted development practices.'
  )

  expect(`${aboutData.description2} ${aboutData.description3}`).not.toContain('10+ years')
})
