# Cursor-Tracking Portfolio Redesign

## Goal

Redevelop Abhilash Sandi's existing React portfolio around the cursor-reactive 3D hero described in `sl_tech_journal_cursor_tracking_hero_tutorial.pdf`, while preserving the existing portfolio content and converting the tutorial's female reference into a recognizable male character based on Abhilash's supplied headshot.

## Approved Direction

- Visual direction: Warm Studio.
- Character: stylized 3D male portrait preserving Abhilash's identity, hair, beard, skin tone, and facial structure.
- Wardrobe: dark overshirt for contrast against the warm neutral backdrop.
- Interaction: frame-based cursor tracking, not runtime MP4 seeking and not CSS 3D transforms.
- Existing sections remain: About, Skills, Experience, Projects, Services, Education, Testimonials, Contact, and Footer.

## Information Architecture

The current split-screen landing section will be replaced by a full-viewport `CursorHero`. The rest of the main page remains in its current order and continues using the existing data modules. The hero navigation links to Work, About, and Contact anchors. The primary actions are Resume and Let's Talk.

## Hero Composition

The hero uses a soft stone background with near-black typography. A floating frosted-glass navigation pill sits at the top center. The left side contains the introduction, an editorial script treatment for "Abhilash," a compact full-stack developer statement, and the two primary actions. The character occupies the right side without crowding the copy.

Desktop and large tablet layouts retain the two-sided composition. Small screens stack the content and character, suppress the custom cursor, and display the centered portrait without tracking when a precision pointer is unavailable.

## Character Asset Pipeline

1. Generate a polished 3D male character from the supplied headshot. Preserve identity and use the PDF only for pose, framing, lighting, and artistic treatment.
2. Place the character in a dark overshirt against the exact Warm Studio background color.
3. Generate a fixed-camera directional animation covering center and a continuous circular sequence through the eight compass directions. Only the eyes, head, and subtle hair movement may animate.
4. Inspect the animation and extract 64 evenly spaced WebP frames along the head-turn path, plus `center.webp`.
5. Optimize frames for a balance of sharp facial detail and practical initial-page weight.

If a suitable directional source animation cannot be produced in the available tooling, implementation may temporarily ship with the center portrait and the complete frame-rendering architecture. The fallback must remain visually finished rather than showing placeholders.

## Runtime Architecture

`CursorHero` owns presentation and delegates tracking math and asset loading to focused utilities/hooks. The frame loader preloads the 64 directional WebP assets and the center portrait. A `requestAnimationFrame` loop calculates the pointer angle relative to the configured face center, smooths it using shortest-path circular interpolation, maps it to a frame index, and draws exactly one opaque frame to a canvas.

A center dead zone displays `center.webp` to create direct eye contact. The page does not seek or play the source MP4 at runtime, does not alpha-blend neighboring frames, and does not apply perspective or rotation transforms to the canvas or character container.

Hero configuration - frame count, asset base path, face center, dead-zone radius, smoothing factor, and Warm Studio colors - remains separate from rendering code. Existing data files remain the source of truth for Abhilash's name, role, biography, resume, social links, projects, and contact details.

## Interaction and Accessibility

The custom magnetic cursor is enabled only for fine pointers. Keyboard users retain standard focus behavior and visible focus styles. Touch devices, `prefers-reduced-motion` users, and failed or incomplete frame loads receive the centered still portrait. Hero content remains semantic text rather than canvas-rendered text. The canvas/portrait has an accessible description, and decorative cursor elements are hidden from assistive technology.

## Failure Handling

- Frame load failure: render `center.webp` and keep all text and actions usable.
- Partial frame load: do not enter tracking mode; use the centered portrait.
- Unsupported canvas or coarse pointer: use the centered portrait.
- Resize/orientation change: recompute the face center and render dimensions without restarting asset loading.
- Component unmount: cancel animation frames and pointer listeners.

## Testing and Verification

- Unit-test angle normalization, shortest-path interpolation, dead-zone selection, and frame-index mapping.
- Component-test the loading, ready, reduced-motion, coarse-pointer, and failed-load states.
- Run the production build.
- Visually review desktop, tablet, and mobile layouts.
- Verify keyboard navigation, focus visibility, readable contrast, and reduced-motion behavior.
- Confirm that tracking draws one frame per animation tick with no video playback, CSS 3D transform, or alpha-blended ghosting.

## Scope Boundaries

This redesign changes the hero and any minimal shared navigation styling needed to integrate it. It does not rewrite the existing portfolio content, replace unrelated sections, add a CMS, or migrate the application to a different framework.
