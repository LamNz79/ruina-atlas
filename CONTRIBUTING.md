# Contributing to Ruina Atlas

> **Fan project disclaimer:** Ruina Atlas is a fan-made project and is not affiliated with or endorsed by [Project Moon](https://projectmoon.fandom.com/wiki/Project_Moon). All lore and literary connections are researched by fans.

Thank you for your interest in contributing! This page explains how to work with this project.

---

## How to Contribute

### 1. Data Corrections & Additions

The most valuable contributions are lore accuracy improvements. If you spot something wrong or missing:

- **Lore corrections:** Open a [bug report](.github/ISSUE_TEMPLATE/bug.yml) — describe the error and the correct information
- **New literary connections:** Open a [feature request](.github/ISSUE_TEMPLATE/feature.yml) — share the source material and how it connects
- **New canto annotations:** Open a [feature request](.github/ISSUE_TEMPLATE/feature.yml) — include a spoiler-free summary for Canto 8 and below

> **Spoiler policy:** Do not include uncensored spoilers for Canto 9 or later in any text content. Data entries for post-Canto 9 content should be clearly labeled in the JSON.

### 2. Code Contributions

For UI, logic, or infrastructure improvements:

1. **Open an issue first** — describe the problem or proposed change
2. **Discuss before submitting a large PR** — saves you work if the approach needs adjustment
3. **Open a pull request** referencing the issue (e.g. `Closes #12`)
4. PRs require at least 1 approval before merging

### 3. Community Guidelines

- Be respectful — this is a fan project built and maintained by volunteers
- Lore contributions should be backed by source material (games, wikis, official art)
- Do not make sweeping changes to the data model without discussing in an issue first
- All contributions are subject to the maintainer's review

---

## Development Setup

```bash
# Clone the repo
git clone https://github.com/LamNz79/ruina-atlas.git
cd ruina-atlas

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- D3.js (force-directed graph)
- React Router v6

---

## Branch Naming

Use descriptive names with a type prefix:

| Prefix | Use for |
|--------|---------|
| `fix/` | Bug fixes |
| `data/` | Data corrections or additions |
| `docs/` | Documentation |
| `feat/` | New features |
| `chore/` | Maintenance, tooling, deps |

**Examples:**
```
fix/spoiler-gate-threshold
data/add-kafka-connections-gregor
docs/improve-readme
feat/add-sinner-profile-cards
```

---

## File Structure

```
src/
  data/
    sinners.json              ← Sinner entries + identities + EGOs
    literarySources.json      ← Literary references
    crossGameEntities.json   ← Wings, Abnormalities, recurring chars
    cantos.json              ← Canto metadata (spoiler levels)
    ego.json                 ← EGO data (auto-generated)
  components/
    LoreGraph.tsx            ← D3 force graph
    LorePanel.tsx            ← Sinner detail panel
    EntityPanel.tsx          ← Cross-game entity panel
    FilterPanel.tsx          ← Filter sidebar
    SourceExplorer.tsx       ← Literary source modal
  pages/
    About.tsx                ← /about page
  types/
    index.ts                 ← TypeScript interfaces
public/
  assets/
    identities/              ← Identity card images
    ego_output/images/        ← EGO images
```

---

## Data Standards

When adding or editing data entries:

- **Literary sources:** Use the full title as it appears in the source material. Include author and year if known.
- **Canto annotations:** Keep summaries 1-2 sentences. Flag major character appearances with `isMajor: true`.
- **Themes:** Use existing theme keys from `src/types/index.ts` where possible.
- **No fabrication:** Do not add connections, summaries, or annotations that cannot be verified in-game or from official sources.

---

## PR Checklist

Before submitting a pull request:

- [ ] `npm run build` passes with no errors
- [ ] New data entries follow the file structure above
- [ ] No spoilers for Canto 9+ in text content
- [ ] PR description references the relevant issue (e.g. `Closes #12`)

---

## Questions?

Open a discussion in [GitHub Discussions](https://github.com/LamNz79/ruina-atlas/discussions) or open an issue with the `question` label.
