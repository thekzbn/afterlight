# Future Echo

Build Afterlight: a minimal, ethereal time capsule app where people send messages to themselves in the future, from tomorrow to 50 years ahead.
The goal is not to make a conventional messaging, productivity, or dashboard application. Afterlight should feel like a quiet digital sanctuary where memories physically exist in space: present messages are released into an atmospheric constellation, drift away into the future, and eventually return as hazy recollections when their delivery date arrives.

Visual & Design
Pure white canvas: The entire application uses stark, pure white #ffffff as its base. No tinted page background. All color and atmosphere should come from the floating memories and their interaction with the glass.
Palette: Use the "Afterthought" palette for memories and atmospheric objects:
Powder fuchsia #F3D3F1
Mist pink #F5E0F0
Near white violet #F3F1F9
Whisper rose #F8EDF3
Light pink #F1B1E1
Delicate turquoise #D7EAE6
Whisper blue #EDF0F8
Near white rose #F9F1F5
Light sky blue #B1D9F1
Whisper azure #EDF2F8
Powder mint #D3F3E7
Liquid glass: Use a deep liquid-glass aesthetic inspired by Bernard Polidario's technique.
Implement an SVG liquid distortion filter using feTurbulence with baseFrequency around 0.01–0.02 and numOctaves="2", combined with feDisplacementMap using a scale around 150–200.
Pair the distortion with heavy backdrop blur, approximately blur(1.5rem).
Use subtle internal specular lighting:
inset 0 0.125rem 0.125rem rgba(255,255,255,0.85)
inset 0 -0.0625rem 0.125rem rgba(255,255,255,0.3)
Use crisp borders, layered translucency, subtle ambient tinting, and strong rounded geometry.
Pills should use border-radius: 9999px; other elements should use generous rounded shapes rather than sharp corners.
Typography: Geist Sans everywhere. Zero monospace.
The only typography exception is the Google authentication button, which uses Google Sans Flex.
Use rem for spacing, padding, borders, and typography.
Zero noise: No unnecessary headings, explanatory copy, marketing copy, cards, dashboards, badges, status labels, or toast notifications.
Do not turn the interface into a collection of glass cards. There should be one primary glass surface surrounded by open space.

The Background & Remembrances
When first arriving with no memories, the canvas is just a pure white room with the solitary glass composer.
Future memories (called future memories or remembrances) appear as soft chromatic volumetric orbs and fuzzy organic forms suspended in 3D space.
Do not use square cards, text bubbles, message previews, or conventional UI components.
Use different scales, blur levels, opacity, and apparent depth to create a subtle 3D constellation.
Memories should drift continuously and very slowly using smooth pseudo-random movement (Perlin-noise-like curves or multiple sine waves). Motion should never feel like a short looping animation; objects should wander indefinitely.
Keep enough separation between objects that they never visibly collide.
Extremely subtle pointer/touch parallax based on depth.
When a memory passes behind the composer, the liquid glass visibly refracts, bends, distorts, and shimmers its colors.
On the main composer screen, future remembrances are sealed. Interacting with one whispers only its delivery horizon/date beside the orb. The content stays sealed until delivery.

Main Screen / Composer
Center one floating liquid-glass pill in the viewport, weightless and suspended above the constellation.
Include:
Message input
Image attachment action (maximum 2 attached images)
Date/time control
Release/send action
Keep controls minimal and icon-driven where obvious. No unnecessary labels or helper text. No sign-out button.

Custom Date & Time
The date/time interaction should feel like part of the glass rather than a browser form.
Delivery dates must be from tomorrow through 50 years in the future. Past dates and today are disallowed.
When activated, right-side composer controls smoothly tuck away to make room for the date/time editor.
Elegant inline date representation: e.g. "14th October, 2038" with dynamic ordinal (1st, 2nd, 3rd, 4th...).
12-hour time: e.g. "08:42 PM". Normalize 24-hour inputs automatically. Clicking AM/PM toggles it. Compact and elegant, no bulky calendar widget.

Release Ritual
Sending a memory should feel physical. On release, the message emerges from the composer as a sharp, tangible entity, moves backward into the surrounding space, gradually blurs and softens, and becomes one of the floating chromatic remembrances in the background.
No toasts, modals, or confirmation popups.

Memories View
A single minimal rewind/history icon strictly in the top-right corner (a clock whose circumference incorporates a counter-clockwise arrow).
Clicking transitions to the Memories view for unlocked memories whose delivery date has arrived or passed.
Unlocked memories float within the same white atmospheric environment as hazy memory capsules / chromatic orbs.
Clicking/focusing an unlocked memory lifts the blur, revealing crisp Geist Sans text and attached photographs.
Clicking/tapping away returns it to its hazy state.
No email notifications or external alerts; this is a pure sanctuary visited on the user's terms.

Authentication & Backend
Use Lovable Cloud for authentication and persistence.
Silent central liquid-glass authentication gate on first arrival with Google sign-in (Google Sans Flex, Google Blue #4285F4). No email/password inputs or separate page. Once authenticated, the gate seamlessly transitions into the composer.
Persist user accounts, messages, creation timestamps, delivery dates/times, and attached images (max 2 per memory) in Lovable Cloud.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/915a1677-b2c9-4f5c-bba4-64ee8af1042a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
