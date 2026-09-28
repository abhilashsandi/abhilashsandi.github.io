# Mobile Motion and Layout Polish Design

## Goal

Remove excess space from the desktop About section, eliminate the mobile hero gap and text/portrait overlap, and improve the neutral portrait by using the supplied open-eyed still image. Add an optional mobile tilt interaction that reuses the existing directional frame sequence.

## Desktop About Layout

The About section will use a wider content container and an explicit two-column layout. The text column receives most of the available width, while the decorative illustration uses a smaller fixed/minimum column. This prevents the heading and paragraphs from wrapping into narrow columns and reduces the section's vertical footprint without changing its content or warm-studio styling.

## Mobile Hero Layout

At the mobile breakpoint, the portrait becomes a normal grid item instead of an absolutely positioned layer above a placeholder row. The copy occupies the next row and starts immediately after the portrait. The layout will not rely on `align-self: end`, so unused viewport height cannot be inserted between the image and copy. The navigation remains overlaid at the top.

## Neutral Portrait

The supplied `download (1).png` becomes the neutral/static portrait asset. It is shown:

- on mobile before motion access is granted;
- whenever motion access is denied or unavailable;
- when reduced motion is requested;
- while directional frames are loading or if canvas/frame loading fails;
- at the desktop cursor dead zone.

The asset will be copied into the public character assets directory without altering the user's source file.

## Mobile Motion Interaction

Mobile motion is opt-in. A compact `Enable motion` button appears over the portrait on coarse-pointer devices when reduced motion is not requested. Pressing it requests `DeviceOrientationEvent` permission when the browser exposes `requestPermission`; otherwise it begins listening for orientation events directly.

The first valid sensor reading establishes a neutral baseline. Relative `gamma` (left/right tilt) and `beta` (front/back tilt) values are normalized, clamped, and converted to the same screen-space angle used by desktop pointer tracking. The existing frame-angle mapping and circular interpolation remain the single source of truth for directional animation.

The canvas becomes visible only after permission is granted, frames are ready, and a valid sensor reading is received. Until all three conditions are true, the open-eyed static image stays visible. Permission denial, API errors, missing sensor events, or unsupported browsers never hide the static portrait.

## Accessibility and Privacy

Sensor access is never requested on page load. The user initiates it through a clearly labeled button. The button reports enabling, enabled, denied, or unavailable states without blocking navigation. Reduced-motion users are not offered the motion control. Sensor listeners and animation frames are removed when the hero unmounts.

## Testing

Automated tests will cover orientation normalization, clamping, baseline-relative angle calculation, and the static-before-permission behavior. Existing pointer mapping tests remain unchanged. Local browser verification will cover desktop About width, mobile portrait/copy adjacency, no horizontal overflow, the open-eyed static fallback, and the motion-control states that can be simulated without physical sensor hardware.
