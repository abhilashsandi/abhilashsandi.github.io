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
