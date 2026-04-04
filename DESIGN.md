```markdown
# Design System Document: The High-End Editorial Travel Experience

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Curated Expedition."** 

Unlike standard travel platforms that feel like rigid databases, this system is designed to feel like a premium, tactile travel journal coming to life. We are moving away from "template-style" layouts toward a high-end editorial aesthetic. The goal is to induce a "flow-state" for the user—achieved through intentional asymmetry, fluid transitions, and a sophisticated tension between adventurous serif typography and ultra-clean functional data. We prioritize immersion over information density; every interaction should feel like a rhythmic expansion and contraction, mimicking the natural pace of discovery.

## 2. Colors
This system utilizes a palette of deep earth tones and atmospheric tints to evoke a sense of professional reliability and outdoor exploration.

*   **Primary (#ad2700 / Terracotta):** Used for key brand moments and primary actions. It represents the "earth" and the human element of travel.
*   **Secondary (#4d6453 / Forest Green):** Provides a grounding effect, used for community features and secondary interactive elements.
*   **Tertiary (#3e5f6f / Mountain Blue):** Used for data-heavy sections and auxiliary information to provide a sense of calm and clarity.

### The "No-Line" Rule
To maintain a high-end feel, **1px solid borders are strictly prohibited** for sectioning. Boundaries between content areas must be defined solely through:
1.  **Background Color Shifts:** Placing a `surface-container-low` section against a `surface` background.
2.  **Tonal Transitions:** Using subtle shifts in the surface hierarchy to signal the end of one thought and the beginning of the next.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine papers or frosted glass. Use the `surface-container` tiers (Lowest to Highest) to create depth. An inner card should use `surface-container-lowest` when sitting on a `surface-container-low` section to create a soft, natural lift.

### The "Glass & Gradient" Rule
Floating elements (like navigation bars or hovering info clusters) must utilize **Glassmorphism**. Apply a semi-transparent surface color combined with a `backdrop-blur`. For primary CTAs, use a subtle gradient transitioning from `primary` to `primary_container` to add "chromatic soul" and depth that a flat hex code cannot achieve.

## 3. Typography
The typography strategy is a dialogue between the "Adventurer" (Newsreader) and the "Cartographer" (Plus Jakarta Sans).

*   **Display & Headlines (Newsreader):** Use these for storytelling and high-level editorial headers. The bold, expressive serif conveys character, history, and the grit of travel.
*   **Title & Body (Plus Jakarta Sans):** These are the workhorses. Use them for interactive data, wayfinding, and long-form descriptions. They provide the "Professional" pillar of the brand's vibe—high legibility and modern precision.
*   **Hierarchy as Identity:** Create drama by pairing a `display-lg` serif headline with a much smaller `label-md` sans-serif sub-header. This scale contrast is what makes the design feel "editorial" rather than "industrial."

## 4. Elevation & Depth
Depth in this design system is conveyed through **Tonal Layering** rather than traditional structural shadows.

*   **The Layering Principle:** Stacking `surface-container` tiers creates a natural sense of hierarchy. A "Highest" container will naturally feel closer to the user than a "Low" container.
*   **Ambient Shadows:** When a floating effect is required (e.g., a high-priority modal), use extra-diffused shadows. 
    *   **Blur:** 24px–48px. 
    *   **Opacity:** 4%–8%. 
    *   **Tint:** Use a tinted version of `on-surface` rather than pure black to mimic natural light.
*   **The "Ghost Border":** If a container requires a boundary for accessibility, use the `outline-variant` token at **10%–20% opacity**. Never use a 100% opaque border.
*   **Glassmorphism Depth:** Encourage the use of `surface_variant` with 60% opacity and a 12px blur for overlay elements to keep the "travelling aesthetic" immersive and integrated.

## 5. Components

### Buttons
*   **Primary:** Bold `primary` fill, white `on-primary` text, `rounded-full` for an organic, approachable feel.
*   **Secondary:** `surface-container-highest` fill with `on-surface` text. No border.
*   **Interactive State:** On hover, buttons should subtly expand (1.02x scale) to mimic the "flow-state" animation style.

### Chips
*   Used for travel tags (e.g., "Off-the-grid," "Luxury"). Use `secondary_container` with `on_secondary_container` text. Shapes should be `rounded-md`.

### Cards & Lists
*   **Constraint:** Forbid the use of divider lines.
*   **Execution:** Separate list items using `spacing-4` vertical gaps or alternating between `surface-container-low` and `surface-container-lowest`.
*   **Content:** Cards should feel like "objects" with generous `spacing-6` internal padding.

### Input Fields
*   Use `surface-container-low` for the field background. 
*   **Focus State:** Instead of a heavy border, use a 2px `primary` bottom-bar or a subtle glow effect to indicate activity.

### Additional Signature Component: "The Travel Cluster"
Inspired by Mityu AI, these are interactive icon groups that expand on scroll. Use `rounded-full` containers with `backdrop-blur` and `tertiary_fixed` backgrounds to highlight local amenities or weather data.

## 6. Do's and Don'ts

### Do:
*   **Embrace Negative Space:** Use the `spacing-20` and `spacing-24` tokens to let the editorial headlines breathe.
*   **Use Intentional Asymmetry:** Offset images and text blocks to create a rhythmic, non-linear reading experience.
*   **Layer with Purpose:** Ensure that "nested" elements always move from a darker surface to a lighter surface (or vice-versa) to signal hierarchy.

### Don't:
*   **Don't use 1px Dividers:** This kills the "premium" feel immediately. Use whitespace or tonal shifts instead.
*   **Don't Over-Shadow:** Avoid "heavy" Material Design shadows. If it looks like a drop-shadow from 2014, it's too dark.
*   **Don't Cram Content:** If a screen feels busy, increase the `spacing` tokens. High-end travel is about the luxury of space.
*   **Don't Mix Type Moods:** Never use Newsreader for functional labels or data points; keep the serif for the "soul" and the sans-serif for the "stats."```