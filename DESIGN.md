---
name: Oddly
description: Marketing advice expressed through clarity, connection and the supplied Oddly identity.
colors:
  accent: "#c9450b"
  brand-orange: "#ea571a"
  background: "#fffdf9"
  foreground: "#161329"
  muted: "#646172"
  surface: "#f2f0ec"
  line: "#dedbd5"
  button-text: "#ffffff"
  dark-accent: "#fa8655"
  dark-background: "#161329"
  dark-foreground: "#fffdf9"
  dark-muted: "#bab6cb"
  dark-surface: "#201d35"
  dark-line: "#3b374f"
  dark-button-text: "#161329"
  evolved-background: "#ffead8"
  dark-evolved-background: "#302036"
typography:
  display:
    fontFamily: "Barlow, sans-serif"
    fontSize: "clamp(40px,5.05vw,74px)"
    fontWeight: 500
    lineHeight: 1.13
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Barlow, sans-serif"
    fontSize: "clamp(34px,4vw,56px)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-.035em"
  title:
    fontFamily: "Barlow, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-.02em"
  body:
    fontFamily: "Barlow, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Barlow, sans-serif"
    fontSize: "13px"
    fontWeight: 600
rounded:
  control-circle: "50%"
  language-control: "24px"
  language-panel: "12px"
  language-option: "8px"
spacing:
  row: "22px"
  component-gap: "24px"
  mobile-section: "72px"
  section: "112px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.button-text}"
    padding: "18px 22px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    padding: "18px 22px"
  button-disabled:
    backgroundColor: "{colors.line}"
    textColor: "{colors.muted}"
    padding: "18px 22px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control-circle}"
    width: "44px"
    height: "44px"
  navigation:
    backgroundColor: "var(--page-background)"
    textColor: "{colors.foreground}"
    height: "80px"
  statement-panel:
    backgroundColor: "color-mix(in srgb,var(--page-background) 80%,var(--foreground) 4%)"
    textColor: "{colors.foreground}"
    padding: "30px 40px 48px"
  faq-disclosure:
    textColor: "{colors.foreground}"
    padding: "26px 0"
  process-tab:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    padding: "24px 18px"
  process-tab-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.button-text}"
    padding: "24px 18px"
  process-panel:
    backgroundColor: "color-mix(in srgb,var(--page-background) 80%,var(--foreground) 4%)"
    textColor: "{colors.foreground}"
    padding: "44px"
  contact-panel:
    backgroundColor: "color-mix(in srgb,var(--page-background) 87%,var(--accent) 13%)"
    textColor: "{colors.foreground}"
    padding: "64px"
  language-trigger:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.language-control}"
    padding: "10px 14px"
  language-panel:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.language-panel}"
    padding: "12px"
  language-option:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.language-option}"
    padding: "12px"
---

# Design System: Oddly

## Overview

**Creative North Star: "The connected evaluation"**

Oddly combines supplied script artwork, deep blue ink, orange emphasis and generous Barlow typography with Merienda script accents. Fine rules and flat tonal surfaces organize the content without competing with the brand. In the hero, the Oddly isotype repeatedly assembles itself from connected points and settles into the clean mark, giving the system a recognizable language of evaluation and connection.

Light is the initial theme. An explicit dark choice persists in local storage and is applied before hydration. Scroll-driven rotation, perspective tilt, continuous background evolution and hover feedback make relationships visible while preserving readable content, the native cursor and user control.

**Key Characteristics:**

- Supplied Oddly artwork with optimized derivatives.
- Barlow for structure, Merienda reserved for emphasis words, spacious headings and concise labels.
- Flat surfaces, fine rules and orange emphasis in two themes.
- A connect-the-dots isotype, growing curved trails and pointer tilt with reduced-motion support.

## Colors

Warm paper, deep blue ink and an orange interface accent form the palette. The YAML frontmatter is normative; CSS custom properties in `src/app/globals.css` are the implementation source.

### Primary

- **Interface orange** (`accent`): contact buttons, emphasized heading text, process numbers, focus outlines, progress and canvas signals. `dark-accent` replaces it in dark mode.
- **Supplied artwork orange** (`brand-orange`): the identity artwork's orange reference, retained separately from the more legible light-theme interface accent.

### Neutral

- **Warm paper / deep blue ink** (`background`, `foreground`): page and readable text. Their roles exchange in the dark theme.
- **Secondary ink** (`muted`, `dark-muted`): descriptions and supporting labels.
- **Tonal panel** (`surface`, `dark-surface`): base surface tokens and unselected process-tab hover. Statement, process-panel and contact fills now derive from the continuously evolving page background.
- **Fine divider** (`line`, `dark-line`): navigation, lists, FAQ and footer rules.
- **Button ink** (`button-text`, `dark-button-text`): white in light mode, deep blue in dark mode.

Page and sticky-header backgrounds evolve continuously with document scroll: `--scroll-evolution` runs from (0%) to (100%) and `--page-background` uses `color-mix(in srgb,var(--background),var(--evolved-background) var(--scroll-evolution))`. Light blends warm paper toward `evolved-background`; dark blends deep ink toward `dark-evolved-background`. The mix follows absolute scroll depth instead of resetting after a section leaves view.

The process section is transparent and inherits the evolving page palette. Its panel and the statement panel use `color-mix(in srgb,var(--page-background) 80%,var(--foreground) 4%)`. Contact and statement hover use `color-mix(in srgb,var(--page-background) 87%,var(--accent) 13%)`. Text, rules, selected tabs and controls retain the chosen theme's semantic colors; no independent immersion palette is applied.

**The Theme Pair Rule.** Resolve each semantic color through the active theme; keep the supplied orange artwork distinct from the accessible interface accent.

## Typography

**Primary Font:** Barlow, with sans-serif fallback.  
**Accent Font:** Merienda, with cursive fallback, only on emphasis words (hero "vender mejor.", approach "tu empresa.").

Both load from Google Fonts through `next/font/google` with `display: swap`; Barlow at 400, 500, 600 and 700. Medium headings retain an open, conversational character; semibold labels signal actions without uppercase decoration.

### Hierarchy

- **Display:** the frontmatter ramp serves the hero; desktop fixes at (74px) above (1450px), uses (4.85vw) at or below (1100px), then `clamp(32px,8.7vw,52px)` at or below (700px) and (29px) at or below (360px).
- **Headline:** the frontmatter ramp serves section headings. Contact uses a smaller contextual ramp; its mobile heading is (29px).
- **Title:** the frontmatter role serves list headings; interactive process questions use their contextual panel ramp described in Components.
- **Body:** the frontmatter role serves paragraphs. Hero description is (17px), becoming (15px) on mobile. Supporting lists and FAQ answers use (14px). Typical paragraph measures range from (44ch) to (53ch).
- **Label:** the frontmatter role serves actions and process numbers. Navigation is medium (500). Diagram and ancillary labels use (12px), with tabular process numerals.

Spanish and Portuguese use the base display ramp. English overrides the hero to `clamp(38px,4.85vw,71px)`, then `clamp(29px,8.2vw,49px)` at (700px), and (28px) at (360px). All three languages use the same Barlow weights, heading hierarchy and semantic palette; localized wording determines these measured display-fit adjustments.

**The Voice Rule.** Use Barlow for display and body and keep Merienda to single emphasis words; use the supplied artwork for the Oddly wordmark.

## Layout

The centered shell has width `min(100% - 112px,1320px)`. At or below (1100px), gutters become (36px) per side; at or below (700px), they become (20px). Section padding is (112px) vertically, becoming (72px) on mobile.

Desktop combines asymmetric two-column regions with long horizontal rules. The hero uses (1.6fr / 1fr), changing to (1.65fr / 1fr) at (1100px) and one column at (700px). Approach, advisory and FAQ use contextual two-column proportions and (90–110px) gaps, reducing to (54px) at (1100px), then stacking at (700px). The process explorer uses two columns (1fr / 1.1fr) with a (64px) gap, reducing to (30px) at (1000px). At (700px), it stacks a two-by-two tab grid above the panel with a (24px) gap. Contact stacks at (1000px).

The header keeps language selection visible on desktop and mobile. At (1100px), navigation link gaps become (18px); at (700px), the inner gap becomes (10px) and control gaps become (7px). The sticky header is (80px) tall, becoming (74px) at (700px). Desktop navigation becomes the mobile menu at (1000px); the header contact action is hidden at (700px). Anchor scroll offset is (100px), changing to (88px) on mobile. The diagram has aspect ratio (1 / 1.08), changing to (1.15) with a (370px) maximum mobile width.

## Elevation & Depth

The main interface uses tonal layering and borders. The language popover alone uses a soft shadow to separate its temporary layer from page content. A solid sticky header, (1px) rules and background changes establish depth. Canvas connection lines use low opacity; the signature canvas adds true perspective projection, depth-scaled orbits and a matte radial-gradient orange core. Pointer tilt uses perspective rather than shadows. No blur or glow vocabulary is established.

### Shadow Vocabulary

- **Language popover** (`0 12px 32px rgba(22,19,41,.14)`): the temporary language-selection panel. Main content panels retain tonal separation without shadows.

**The Flat Surface Rule.** Separate page regions with tonal surfaces and fine rules; reserve the existing soft shadow for the language popover.

## Shapes

Buttons and panels retain square corners. Icon, theme, menu and diagram motion controls are circular (`control-circle`), with (44px) targets. Thin dividers, circular diagram nodes and cubic curved edge trajectories provide the recurring geometry. The language trigger uses pill corners (`language-control`); its floating panel has softer rounded corners (`language-panel`), with compact rounded option rows (`language-option`). The supplied script logo remains an artwork asset, never a reconstruction.

Brand derivatives come from the user-supplied files recorded in `public/brand/ORIGINS.md`. `scripts/prepare-brand-assets.mjs` crops transparent margins and resizes them; no logo was generated or redrawn. Dark blue artwork is shown on the light surface, white artwork on the dark surface, and the original white artwork supplies the complete background watermark. The optimized orange derivative remains in the asset library with its provenance preserved; it is not currently rendered.

## Components

### Buttons

Direct, square actions use the primary and outline frontmatter variants. The primary has an accent fill, theme-specific button ink, a (1px) transparent border and minimum height (56px). The outline has a fine divider border. At (700px), padding changes to (16px 20px), minimum height to (54px), and font size to (13px).

Fine-pointer hover lifts buttons (3px); directional SVGs move (2px, -2px). A foreground-colored pseudo-element wipes upward from (102%) over (300ms), changing button text to the theme background on hover or keyboard focus. Active controls scale to (.98). Disabled controls use the divider and muted ink without transforms. All keyboard targets receive an accent outline (2px) with (5px) offset. Hover is restricted to hover-capable fine pointers.

### Cards / Containers

Flat statement and contact panels derive their fills from the evolving page palette. The statement padding is (30px 40px 48px), becoming (26px) on mobile; contact changes from (64px), to (40px) at (1100px), to (30px 24px) at (700px). There is no generic raised-card system. Repeated assessment and outcome rows use fine top rules and small horizontal hover motion (5px). Assessment titles become orange; outcome SVGs rotate (180deg) on the Y axis. The statement panel blends its page-derived fill with accent on hover and its copy sits at `translateZ(30px)`. Tilt-enabled containers respond to a mouse with `perspective(900px)`, at most (±6deg) X and (±8deg) Y rotation, returning on pointer exit. The contact panel includes a thin accent circle (500px) that expands to scale (2) on hover or focus within.

### Navigation

Solid sticky navigation uses medium labels, fine divider borders and circular controls. Links receive an orange underline on hover. Theme toggling updates semantic colors, persists `oddly-theme` and refreshes canvas colors. The mobile dropdown has native links, an expanded-state control, Escape-to-close with focus return, and a short entrance. A skip link becomes visible on keyboard focus.

### Language selection

A native `details` / `summary` disclosure beside the theme control opens a custom language panel. Its trigger combines a globe, the current language's full native name and a chevron. It has a (44px) minimum height, (12px) medium text, (8px) gap, padding (10px 14px), a fine divider border and `language-control` pill corners. Open state changes the fill to the theme surface, makes the border orange and rotates the chevron (180deg). Active press scales to (.97); fine-pointer hover uses the tonal surface and foreground border.

The desktop panel is (256px) wide, positioned (12px) below the trigger and right-aligned. It has (12px) padding, semantic background, a fine border, `language-panel` corners and the language-popover shadow. A localized title introduces three link rows: “Español”, “English” and “Português”, each using its native language attribute. Every row includes a localized description or current-language status, with a check for the active locale and an uppercase code for other choices. Rows have (64px) minimum height, (12px) padding, (16px) gap and `language-option` corners. Native names use (14px) medium text; descriptions and the preference reminder use (11px). The active row blends (90%) background with (10%) accent. Keyboard focus uses the existing accent outline with (-2px) offset on rows.

At (700px), the trigger retains the globe and chevron but replaces the full language name with an (11px) uppercase code; padding becomes (10px) and gap (6px). The panel becomes fixed at (86px) from the viewport top with (20px) left/right insets and automatic width. Opening language selection closes mobile navigation, and opening navigation dismisses language selection.

Native disclosure and links provide no-JavaScript operation. With JavaScript, Arrow Up/Down opens or cycles rows; Home/End move to first/last, Space/Enter activate, Escape closes and restores trigger focus, and letter typeahead finds the next matching native language name. Opening focuses the current language unless an arrow key requests the first or last. Outside pointer input, scrolling, resizing and tabbing away dismiss the panel. Choosing the current language closes without reloading; modifier-assisted links retain native behavior. Normal language navigation updates `?lang=es|en|pt` while preserving the current URL hash and other query parameters.

Middleware gives a valid URL selection precedence over the one-year `oddly-language` preference cookie; Spanish is the default when neither is valid. The chosen locale is server-rendered and assigned to root HTML `lang`, without automatic browser-language switching. Pointer opening animates the panel over (180ms) from (-5px) vertical offset and (.98) scale; keyboard opening suppresses both panel animation and chevron transition. Reduced motion suppresses all transitions and animation.

Visible copy, accessible names, FAQ answers, process stages, canvas labels, WhatsApp messages and metadata use the selected locale. The layout, supplied artwork, themes and motion behavior remain shared across all three languages. Page metadata supplies language alternatives and a Spanish default.

### FAQ disclosure

Native `details` / `summary` elements use fine rules and inline SVG plus/minus states. Open summaries use the accent; answers enter once per opening over (200ms). Desktop summaries use (17px) text with (26px) vertical padding; mobile uses (15px) and (22px).

### Interactive process explorer

Four selectable stages form a tablist beside a tonal panel. Each desktop tab has a fine top rule, minimum height (96px), (18px) text and padding (24px 18px); selected tabs use the active theme accent with button ink. Hover shifts unselected tabs (5px) and their arrows (3px, -3px). Arrow keys cycle stages; Home and End select the first and last. Only the selected tab is in the tab sequence; the focusable panel identifies its active tab.

The desktop panel has minimum height (400px), padding (44px) and a translucent oversized numeral (200px) tilted in perspective. The stage question uses `clamp(24px,2.5vw,36px)` with (1.2) line-height; stage copy uses (15px). Changing stages animates copy upward (14px) from a small X rotation over (400ms). At (1000px), tabs use (16px) text and the panel (30px) padding. At (700px), tabs form a two-by-two grid with (105px) minimum height, (16px) padding and (14px) text; the panel uses (350px) minimum height, (28px) padding, (29px) question text and a (170px) numeral.

### Connected evaluation diagram

Four labeled inputs connect into the Oddly isotype (`StrategyVisual`), drawn on canvas from `public/brand/oddly-symbol.webp`. The isotype's alpha mask is sampled at (240px) into outline nodes spaced at (4.6%) of its width plus sparser interior nodes; each node links to up to four neighbours, and a link is kept only when it stays on the artwork, so no line bridges a gap in the mark. Ink-coloured nodes appear from the base of the isotype towards the tips of its arms over (2.6s), each link growing from the earlier node to the later one, while the four input lines reach the nearest node and a fifth, orange line rises from a point above the caption to the base of the mark. Each of the five points emits a fading ring every (2.4s) and keeps sending three small ink dots along its line, easing in and out, until they disappear into the isotype.

The network then fades as the solid isotype settles in (.9s), in the ink colour and with nothing drawn on or around it. The clean mark holds for (6s), fades out over (.7s), and the points connect again. Under a mouse, the network shows through the mark in the paper colour within (110px) of the cursor. The build restarts each time the hero re-enters the viewport. Animation stops when offscreen, the tab is hidden, or reduced motion is requested; reduced motion renders the clean isotype statically. Theme and resize changes repaint it; device pixel ratio is capped at (2). The diagram has no pause UI, per the user's explicit direction. The native cursor remains visible.

### Curved background trails

A decorative, viewport-sized canvas sits below main content and footer, uses the current theme accent and ignores pointer input. Cubic Bézier paths enter from alternating edges and continue beyond the viewport. An edge-weighted horizontal mask leaves the central content region quiet, reducing mask opacity to (.08) at the center. The baseline is ten trails below (700px), otherwise eighteen. Effective count grows as `baseline × (1 + 3 × progress^1.2)`, reaching (40) on mobile and (72) on desktop at document end. The renderer rounds up the effective count and blends the final fractional path's presence, so added trails appear gradually. Device pixel ratio is capped at (2).

Intensity grows with normalized document scroll using `.03 + progress^1.2 × .4`. Bounded lane offsets use a golden-ratio distribution (`index × .618034 modulo 1`), with separate fractional vertical offsets keeping the larger set varied. Complete routes are cached as `Path2D` objects: (40) below (700px), otherwise (72), rebuilt on resize. Quiet complete arcs show the paths; moving heads travel at (.065 + trailIndex × .003 cycles/s), with a segment length (.12) and progressively thicker strokes. Animation frames stop while the tab is hidden or scroll progress is at or below (1%). Reduced motion renders only static complete curves, without moving heads.

The background has no pause UI, per the user's explicit direction. Hidden-tab and top-of-page suspension preserve elapsed time; reduced motion retains the complete static curves.

### Statement context map

The statement panel contains the Ciclo Oddly wheel (`CycleVisual`) before its rule and message: an outer navy ring repeating “ODDLY”, a stage ring with interlocking arrow segments for Atraer, Interactuar and Deleitar, and a fixed orange core reading “Ciclo Oddly”, separated by light gaps. The outer ring turns counter-clockwise over (60s) and the stage ring clockwise over (36s); reduced motion stops both. The SVG is exposed as one labeled image. It has a (340px) maximum width, (260px) on mobile, and the existing mouse tilt adds depth to the panel.

### Full background watermark

The complete original white Oddly logo is a fixed landing-background layer, rendered after the trails and alongside main content. It is horizontally centered with `left: 50%` and `translateX(-50%)`, positioned at (10vh) from the viewport top, and sized to `min(76vw,600px)` with aspect ratio (600 / 420). It has stacking level (0), while main content and footer sit at (1). The image fills its container with `object-fit: contain`, preserving the supplied wordmark without clipping. It is decorative, ignores pointer input and occupies no document-flow space.

The container's opacity is zero through (58%) document scroll, then grows linearly to (.18) at document end. Dark mode multiplies the image opacity by (.55). This scroll reveal remains available under reduced motion without transition or movement.

The former about content is removed. An empty, decorative `#estudio` anchor preserves incoming links; it adds no introduction surface or brand rotation.

### Entrance and progress behavior

WAAPI reveals observed content once with a (22px) upward entrance, (650ms) duration and `cubic-bezier(.22,1,.36,1)` easing. Sibling delay is (60ms), capped at (180ms). Content remains visible before JavaScript and after animation. Reduced motion skips reveals and cancels active ones. A decorative (2px) top progress rule follows document scroll through a scheduled animation frame. The same frame updates the root continuous scroll evolution percentage and background-watermark opacity. The hero shifts vertically with scroll (.13), capped at (65px) and suppressed on mobile. The statement rule grows from (.25) to (1) scale as it enters view.

CSS control transitions use `--ease-out` (`cubic-bezier(.23,1,.32,1)`) for movement, with (140–700ms) durations. Body/header background and text changes transition over (250ms); process surfaces transition over (650ms); tilt resets over (400ms). Reduced motion removes CSS animations, transitions, smooth scrolling and hover transforms. It also resets pointer tilt and hero translation, suppresses stage-change animation and removes the contact circle. Scroll background evolution and watermark opacity remain available with transitions removed.

## Do's and Don'ts

### Do:

- **Do** preserve the supplied Oddly artwork and its light/dark logo variants.
- **Do** apply semantic theme colors to text, rules, controls and the canvas.
- **Do** keep visible keyboard focus and native FAQ disclosure behavior.
- **Do** stop the diagram when offscreen, hidden or reduced motion is requested.

### Don't:

- **Don't** redraw the wordmark or replace it with typeset text.
- **Don't** add fabricated client logos, testimonials, metrics or dashboard data.
- **Don't** make readable content depend on entrance animation or JavaScript.
- **Don't** replace the native cursor.
