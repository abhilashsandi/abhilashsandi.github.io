import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import About from './About'
import ThemeContextProvider from '../../contexts/ThemeContext'

test('renders the approved professional summary as two paragraphs', () => {
  const { container } = render(
    <ThemeContextProvider>
      <About />
    </ThemeContextProvider>
  )

  const paragraphs = container.querySelectorAll('.about-description > p')
  expect(paragraphs).toHaveLength(2)
  expect(paragraphs[0]).toHaveTextContent('13+ years')
  expect(paragraphs[1]).toHaveTextContent('production Generative AI features')
  expect(container).not.toHaveTextContent("My name's Abhilash Sandi")
})
