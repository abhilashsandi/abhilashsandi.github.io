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
