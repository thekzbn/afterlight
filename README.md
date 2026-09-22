# Afterlight

> *A quiet place to release private memories into your future.*

**Afterlight** is a minimal, atmospheric digital time capsule where people send messages to themselves in the future — anywhere from tomorrow to 50 years ahead.

It is an experimental web project by **[thekzbn labs](https://thekzbn.name.ng/labs)**.

---

## ✦ The Ethos

Afterlight is built around the feeling of being alone with your thoughts. Humans cannot easily hold or recollect events with crisp clarity — memories sit quietly in the back of your mind as hazy, out-of-focus afterthoughts until a specific moment brings them back into view.

Afterlight is designed to feel like a digital sanctuary:
- **No AI, no social feeds, no notifications, no gamification**.
- **Memories exist physically in space**: Released messages drift away into a floating chromatic constellation of sealed thoughts.
- **Honing into memories**: When their appointed delivery date arrives, memories unlock and can be opened in full focus.

---

## ✦ Deep Glass (Glassmorphism 2.0)

To communicate an idea that is present yet out of focus, Afterlight uses **Deep Glass** — a glass-centric skeuomorphic UI paradigm:
- **Liquid Refraction Optics**: Uses inline SVG fractal noise displacement (`feTurbulence` + `feDisplacementMap`) paired with high-saturation OKLCH backdrop blurring to distort light as floating memories drift behind surfaces.
- **Tactile Weightlessness**: The composer and UI objects float without heavy bevels, drop shadows, or rigid cards.
- **Afterthought Palette**: Chromatic hues (fuchsia, pink, violet, rose, sky, mint, azure) inspired by algorithmic color experiments (*"Does Jev understand color?"* by Matt DesLauriers).

---

## ✦ Tech Stack

- **Framework**: React 18 + TanStack Start & TanStack Router
- **Build System**: Vite + Rolldown
- **Styling**: Tailwind CSS v4 + OKLCH Color Space + Custom Liquid Glass Shaders
- **Backend & Auth**: Supabase (Database & Storage) + `@lovable.dev/cloud-auth-js` OAuth
- **Deployment**: Hosted via Lovable hosting environment

---

## ✦ Development & Setup

To run Afterlight locally:

```bash
# 1. Clone the repository
git clone https://github.com/thekzbn/afterlight.git
cd afterlight

# 2. Install dependencies
npm install

# 3. Development server
npm run dev

# 4. Production build check
npx vite build
```

---

## ✦ License & Contribution

- **License**: Released under the [MIT License](LICENSE).
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) for commit standards and development guidelines.
- **Labs Portfolio**: Explore more projects at **[thekzbn.name.ng/labs](https://thekzbn.name.ng/labs)**.
