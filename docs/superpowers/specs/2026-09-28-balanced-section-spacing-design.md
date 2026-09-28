# Balanced Section Spacing Design

## Goal

Reduce excessive vertical whitespace throughout the portfolio on desktop and mobile while preserving the warm studio theme, readable hierarchy, responsive behavior, and existing hero overlap fixes.

## Root Cause

`WarmStudio.css` applies large shared vertical padding to every content section. At a 1440px desktop width, most sections receive about 115px above and below their content. At mobile widths, each section receives 64px above and below. Several component styles add separate heading, container, card, and illustration margins on top of that shared padding.

## Spacing System

- Desktop section padding: use a responsive range of 56px to 72px.
- Mobile section padding: use a responsive range of 36px to 44px.
- Preserve clear section boundaries and the alternating warm backgrounds.
- Reduce internal heading-to-content spacing proportionally.
- Do not reduce text sizes, card content, or interactive target sizes to create density.

## Section Adjustments

### About

- Preserve the decorative line and illustration.
- Tighten the space between the decorative line, illustration, heading, and description on mobile.
- Preserve the wider desktop text column introduced by the existing theme work.

### Skills

- Reduce the heading-to-marquee gap.
- Reduce excess vertical marquee padding and skill-card margins without changing card dimensions or readability.

### Experience, Projects, Services, and Education

- Use the shared balanced section padding.
- Tighten heading margins and large container gaps where they duplicate the shared padding.
- Preserve card spacing sufficient for visual separation and touch interaction.

### Testimonials and Contact

- Remove unnecessary minimum-height pressure where content can define the section height.
- Retain enough room for the testimonial slider controls and contact form fields.
- Keep the existing contact label and button contrast fixes.

## Hero Constraint

Do not change hero typography, portrait sizing, cursor or gyro behavior, action buttons, or the repaired 48px separation between “HI, I’M” and the signature. The existing 32px transition after the hero actions remains the lower bound.

## Responsive Validation

Validate at these representative sizes:

- Desktop: 1440 × 900
- Mobile: 390 × 844
- Tall mobile: 390 × 1080

Confirm that section padding follows the balanced range, the page has no horizontal overflow, text and cards do not overlap, the About illustration remains visible, and the hero spacing remains unchanged.

## Automated Verification

- Add a focused regression test for the shared section spacing rules before editing production CSS.
- Run the focused test and confirm it fails for the current oversized values.
- Implement the minimal CSS changes and rerun the focused test.
- Run the complete React and Python test suites.
- Run a production build and report existing warnings separately from errors.

## Non-Goals

- Redesigning section content or order.
- Changing typography scale, colors, or card visual treatment.
- Modifying the desktop cursor tracking or mobile gyro behavior.
- Publishing or pushing the changes before local verification.
