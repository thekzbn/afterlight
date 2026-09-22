<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Guidelines for Autonomous Agents & AI Assistants

When contributing to **Afterlight**, all AI agents and automated coding tools must strictly adhere to the following rules:

### 1. Frequent & Immediate Commits
* Commit changes **immediately** after completing every discrete change, bug fix, or feature step. Do not batch multiple unrelated changes into single huge commits or delay committing.

### 2. Comprehensive & Intentful Commit Messages
* Every commit message must clearly explain:
  1. The **intent** behind the change (the "why").
  2. A detailed summary of **what was changed** (the "what").
* Never use lazy or single-word commit messages (e.g. `update`, `fix`, `wip`). Use structured messages such as:
  ```text
  feat: add Lovable broker URL and project ID, deepen glass UI, memory expansion animation, update brand favicon
  ```

### 3. Git History Integrity
* Never amend, rebase, squash, or force-push commits that have already been pushed to remote branches.
* Keep the main branch builds passing at all times. Verify builds with `npm run build` or `npx vite build` prior to marking tasks complete.
