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
