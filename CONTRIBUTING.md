# Contributing to Afterlight

Thank you for your interest in contributing to **Afterlight**, a project by [thekzbn labs](https://thekzbn.name.ng/labs)!

## Code of Conduct
Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) in all community interactions.

## Commit Guidelines
We maintain a clean and descriptive git history. When committing changes:

1. **Commit Frequently**: Make small, logical commits as soon as a single change or feature is complete.
2. **Explanatory Commit Messages**: Write detailed commit messages explaining the **intent** behind the change and **what was updated**.
   - Example: `feat: add slide-out inline time input and glass reflection controls`
   - Avoid generic commit messages like `fix`, `wip`, `changes`, or `update`.
3. **Preserve Git History**: Never force push (`git push --force`) or rebase/squash commits that have already been pushed to the remote repository. This project syncs directly with Lovable Cloud hosting, and rewriting history can cause sync conflicts.

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/thekzbn/afterlight.git
   cd afterlight
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```

4. **Verify production build**:
   ```bash
   npx vite build
   ```

## Design Principles

- **Deep Glass (Glassmorphism 2.0)**: Glass is used as an ambient, weightless material rather than a heavy container. Maintain subtle SVG refraction, OKLCH translucent boundaries, and seamless backdrop blurs.
- **Lucid Dream Motion**: Elements in Afterlight should feel alive yet calm, drifting like thoughts in a quiet mind.
- **Minimalism & Zero Noise**: No intrusive banners, dashboards, or unnecessary controls. Keep the sanctuary quiet.
