# Design System Strategy: The Archive of the Infinite Rail

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Curator’s Ledger"**

This design system is not a standard interface; it is an artifact. It represents the intersection of a centuries-old literary tradition and the cold, industrial reality of a high-tech prison train. To move beyond a "template" look, we reject the friendly roundedness of modern web design in favor of sharp edges, intentional asymmetry, and a layout that feels like a meticulously organized dossier.

We break the "standard grid" by employing **high-contrast typography scales** and **overlapping editorial elements**. Information should feel "unearthed" rather than just displayed. Use wide margins juxtaposed with dense, data-heavy clusters to create a sense of intellectual depth and melancholic scale.

---

## 2. Color & Surface Architecture
The palette is rooted in the "Navy Black" of an endless night, punctuated by the "Deep Crimson" of a visceral history.

*   **Primary (`#b8202f`):** Used for critical lore anchors and high-importance calls to action.
*   **Secondary/Accent (`#f5c518`):** Use sparingly. This is "Electric Gold"—the spark of intelligence or the glow of a warning light in a dark corridor.
*   **Neutral Palette:** Layers of `surface-container-lowest` to `highest` provide the structural "bones" of the experience.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Traditional borders feel like "web components"; we want "architectural zones." Boundaries must be defined through:
1.  **Background Shifts:** Place a `surface-container-low` section against a `surface` background.
2.  **Tonal Transitions:** Use a subtle gradient (e.g., `primary` to `primary-container`) to mark the start of a new narrative chapter.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of glass and steel.
*   **Base:** `surface` (#111318)
*   **The Folder:** Use `surface-container-low` for large content areas.
*   **The Document:** Nest `surface-container-high` inside the folder to highlight specific data points or "lore cards."

### The "Glass & Gradient" Rule
For floating menus or contextual overlays, use **Glassmorphism**. Apply `surface-variant` with a 60% opacity and a `20px` backdrop-blur. This ensures the "map" or "lore" beneath is never truly gone, maintaining the user's immersion in the Atlas.

---

## 3. Typography: The Scholar’s Contrast
We utilize a stark juxtaposition between the "Newsreader" serif and the "Manrope" sans-serif to distinguish between *narrative* and *utility*.

*   **Display & Headline (Newsreader):** These are your "Old Library" voices. Use `display-lg` for chapter titles. The elegant, slightly weathered serif evokes the feeling of a heavy, leather-bound book.
*   **Title & Body (Manrope):** The "Sci-Fi" voice. Clean, neutral, and highly readable. This is for the technical descriptions of the train and the cold facts of the world.
*   **Labels (Space Grotesk):** The "Industrial" voice. Use for data points, coordinates, and metadata. Its monospaced feel mimics the output of a high-tech terminal.

**Hierarchy Note:** Use `headline-lg` in `on-primary-container` (Crimson) to create "blood-ink" headers that command immediate attention.

---

## 4. Elevation & Depth
In this system, depth is not achieved through light; it is achieved through **Tonal Layering**.

*   **The Layering Principle:** Avoid shadows where possible. Instead, "stack" your tokens. A `surface-container-lowest` card placed on a `surface-container-low` section creates a natural, recessed "cut-out" look, reminiscent of an industrial control panel.
*   **Ambient Shadows:** If an element must float (e.g., a modal), use an ultra-diffused shadow: `box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5)`. The shadow should feel like a heavy weight rather than a light lift.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use the `outline-variant` at **15% opacity**. This creates a "memory of a line" rather than a hard boundary.

---

## 5. Components

### Buttons: The Industrial Toggle
*   **Primary:** Sharp 0px corners. Background: `primary`. Text: `on-primary` (Warm Ivory). On hover, add a subtle `secondary` (Gold) inner-glow to mimic a powered-on light.
*   **Secondary:** No background. A "Ghost Border" (15% opacity `outline`). Text: `on-surface`.

### Cards & Lists: The Ledger Entry
*   **Forbid Dividers:** Never use a horizontal line to separate list items. Use **Vertical White Space** or alternating background tones (`surface-container-low` vs `surface-container-lowest`).
*   **Asymmetry:** Align titles to the left but place metadata (Labels) in the top-right corner to break the standard "F-pattern" and encourage a more "exploratory" reading style.

### Input Fields: The Terminal Input
*   **State:** Default state uses `surface-container-highest`.
*   **Active:** The bottom border animates to `secondary` (Gold), appearing as a scanning line.

### Additional Component: "The Lore Fragment"
A specific card type for snippets of text. Use a `surface-variant` background with a `tertiary` (Warm Ivory) left-accent bar (4px width). This mimics a bookmark in a ledger.

---

## 6. Do's and Don'ts

### Do:
*   **Do** embrace the 0px radius. Hard corners imply precision and a lack of comfort.
*   **Do** use `on-surface-variant` (Warm Ivory) for long-form reading to reduce eye strain against the navy black.
*   **Do** use intentional "white space" (negative space) to let the dark atmosphere breathe.

### Don't:
*   **Don't** use standard blue for links. Use `secondary` (Gold) or `primary` (Crimson).
*   **Don't** use icons that are too "bubbly" or "friendly." Use thin-stroke, geometric icons that look like technical schematics.
*   **Don't** use pure white (#FFFFFF). It breaks the gothic immersion. Always use the Ivory/Neutral tones provided.

### Accessibility Note:
While the atmosphere is dark, ensure that all lore text (Body-md) maintains at least a 4.5:1 contrast ratio against the surface containers. The "Sophisticated" tone must never compromise the "Intelligent" readability of the data.
