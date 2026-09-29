import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

import Landing from './Landing';
import ThemeContextProvider from '../../contexts/ThemeContext';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }),
  });
});

test('renders the Warm Studio hero identity and actions', () => {
  render(
    <MemoryRouter>
      <ThemeContextProvider>
        <Landing />
      </ThemeContextProvider>
    </MemoryRouter>
  );

  expect(
    screen.getByRole('heading', { name: /abhilash sandi/i })
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /resume/i })).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /let's talk/i })
  ).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /abhilash sandi/i }))
    .toHaveAttribute('src', '/character-assets/abhilash-open-eyed.png');
  expect(screen.getByLabelText(/animated portrait/i)).toHaveAttribute(
    'aria-hidden',
    'true'
  );
  expect(screen.queryByText(/move your cursor/i)).not.toBeInTheDocument();
});

test('renders the compact primary navigation', () => {
  render(
    <MemoryRouter>
      <ThemeContextProvider>
        <Landing />
      </ThemeContextProvider>
    </MemoryRouter>
  );

  expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute(
    'href',
    '/#projects'
  );
});

test('keeps the static portrait when mobile motion permission is denied', async () => {
  window.matchMedia = jest.fn((query) => ({
    matches: query === '(pointer: coarse)',
    media: query,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));
  const requestPermission = jest.fn().mockResolvedValue('denied');
  Object.defineProperty(window, 'DeviceOrientationEvent', {
    configurable: true,
    value: { requestPermission },
  });

  render(
    <MemoryRouter>
      <ThemeContextProvider>
        <Landing />
      </ThemeContextProvider>
    </MemoryRouter>
  );

  const portrait = screen.getByRole('img', { name: /abhilash sandi/i });
  expect(screen.getByRole('button', { name: /enable motion/i })).toBeInTheDocument();
  expect(portrait).toBeVisible();
  expect(screen.getByLabelText(/animated portrait/i)).toHaveAttribute('aria-hidden', 'true');

  fireEvent.click(screen.getByRole('button', { name: /enable motion/i }));

  await waitFor(() => expect(requestPermission).toHaveBeenCalledTimes(1));
  expect(await screen.findByRole('button', { name: /motion denied/i })).toBeDisabled();
  expect(portrait).toBeVisible();
  expect(screen.getByLabelText(/animated portrait/i)).toHaveAttribute('aria-hidden', 'true');
});
