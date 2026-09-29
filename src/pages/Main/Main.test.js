import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Main from './Main';

jest.mock('../../components', () => ({
  Landing: () => <section>Landing</section>,
  About: () => <section>About</section>,
  Skills: () => <section>Skills</section>,
  Experience: () => <section>Experience</section>,
  Projects: () => <section>Projects</section>,
  Services: () => <section>Services</section>,
  Education: () => <section>Education</section>,
  Testimonials: () => <section>Testimonials</section>,
  Contacts: () => <section>Contacts</section>,
  Footer: () => <footer>Footer</footer>,
}));

test('wraps the portfolio in the Warm Studio theme boundary', () => {
  const { container } = render(<Main />);
  expect(container.firstChild).toHaveClass('warm-studio-page');
});
