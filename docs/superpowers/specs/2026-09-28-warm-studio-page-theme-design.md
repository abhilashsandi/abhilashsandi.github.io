# Warm Studio Full-Page Theme Design

## Goal

Extend the approved hero visual system through the rest of the portfolio so the site reads as one continuous editorial experience. Preserve all existing content, section order, links, and functionality. Fix the mobile hero overlap shown at narrow widths.

## Visual Direction

Use the approved **Continuous Editorial** direction:

- Warm cream base (`#e4ded5`) with subtle taupe tonal bands rather than unrelated section colors.
- Charcoal ink (`#241f1b`) for primary text and controls.
- Muted brown (`#6b4d3a`) only for focus and restrained emphasis.
- Translucent cream cards with fine charcoal borders, 20–28px radii, and soft low-contrast shadows.
- Large editorial section headings, uppercase tracked eyebrow labels, pill buttons, and generous whitespace.
- No saturated orange accents, solid gray section backgrounds, or heavy card shadows.

## Implementation Boundary

Create shared Warm Studio CSS tokens at the application level and apply a page wrapper in `Main`. Override the currently active component styles and theme-derived inline colors with narrowly scoped `.warm-studio-page` rules. This keeps the data and component behavior unchanged while giving About, Skills, Experience, Projects, Services, Education, Testimonials, Contacts, and Footer one consistent visual language.

Section backgrounds alternate subtly between the studio base and translucent light/taupe bands. Cards, timeline entries, project panels, service cards, form fields, testimonial controls, and footer elements share the same borders, radii, and restrained shadows.

## Mobile Hero Repair

At widths up to 760px, the hero becomes a deliberate stacked composition:

1. Navigation remains at the top within safe horizontal margins.
2. The portrait occupies a fixed upper visual zone below the navigation.
3. A stronger lower cream gradient creates a clean transition beneath the portrait.
4. Copy moves into normal document flow below the portrait zone rather than being absolutely positioned over the face.
5. The signature name uses a smaller responsive scale and controlled line height.
6. Biography and buttons remain below the name with sufficient spacing; buttons wrap safely on very narrow screens.

The mobile hero remains at least one viewport tall but may grow with content. No navigation, portrait, name, biography, or action overlap is allowed at 320px, 375px, 390px, or 430px widths.

## Accessibility and Responsive Behavior

- Preserve semantic headings, navigation, links, labels, and form behavior.
- Maintain visible focus indicators and WCAG-friendly text contrast.
- Preserve reduced-motion and coarse-pointer fallbacks.
- Avoid horizontal scrolling from cards, timelines, project media, or contact details.
- Keep desktop cursor tracking unchanged.

## Verification

- Add a structural test for the Warm Studio page wrapper.
- Keep existing landing animation and component tests passing.
- Run extraction tests, React tests, and the production build.
- Visually inspect the full desktop page and mobile widths 375×667 and 390×844.
- Verify the hero copy does not overlap the portrait or navigation, and verify every downstream section uses the Warm Studio palette and card treatment.
