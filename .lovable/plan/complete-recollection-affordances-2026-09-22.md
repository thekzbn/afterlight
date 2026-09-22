# Complete recollection affordances

## Changes
- Make unlocked memory orbs gently pulse and reveal a small “open” hint on hover or keyboard focus.
- Pass each orb’s existing hue into the opened recollection and use it as a soft glass tint.
- Keep the recollection shell within `min(36rem, calc(100dvh - 5rem))`, hide outer overflow, and move scrolling into a dedicated inner region.
- Correct recollection content references to read from `focused.memory`.

## Verification
- Open an arrived memory and confirm its hint, matching tint, close behavior, and scrolling at desktop and narrow widths.
- Confirm the page loads without browser errors.
