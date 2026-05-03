# BatchBook Design System

## Overview

**BatchBook** is a modern mobile-first application built with React + Vite. Based on the codebase, it appears to be a batch/order management or booking platform with phone-based authentication (OTP via Firebase). The UI is built on **Material UI v9 (MUI)** with a **Material 3 / Material You** design philosophy, using a **dark theme** as the primary mode.

### Sources
- **GitHub Repo:** `bedantsharma/batchbookui` (https://github.com/bedantsharma/batchbookui)
- **Design Spec:** `GEMINI.md` in the root of the repo (Material 3 design philosophy document)
- **Key Files:** `src/App.jsx`, `src/components/PhoneLogin.jsx`, `src/components/OtpVerification.jsx`

### Tech Stack
- React 19 + Vite
- Material UI v9 (MUI) with MUI Icons
- Tailwind CSS + shadcn/ui (base-nova style, neutral base color)
- Lucide React for icons
- Firebase Auth (phone/OTP)
- Geist (variable font) + JetBrains Mono (variable font) — via `@fontsource-variable`
- `clsx` + `tailwind-merge` for className composition

---

## Products / Surfaces
1. **BatchBook App** — The primary web application. Currently implements phone-number login and OTP verification flows. Dark-themed, card-based, centered layout. Firebase-authenticated. Designed for Indian users (phone numbers prefixed with +91).

---

## CONTENT FUNDAMENTALS

### Tone & Voice
- **Direct and functional** — copy is minimal and task-oriented. Labels tell you exactly what to do: "Login with Phone", "Get OTP", "Verify OTP".
- **Second person ("you")** — the app speaks to the user directly but sparingly.
- **No emoji** — the UI uses no emoji. Icons from MUI/Lucide replace decorative elements.
- **Sentence case** — headings use sentence case ("Login with phone"), not title case.
- **Concise helper text** — e.g., "Enter your 10-digit Indian phone number to receive an OTP." Short, single-sentence instructions.
- **Plain error messages** — errors are descriptive but not alarming: "Please enter a valid 10-digit Indian phone number."
- **No marketing copy** — the existing UI is purely functional, no slogans or taglines are present in code.

### Examples
- `"Login with Phone"` — h5, bold
- `"Enter your 10-digit Indian phone number to receive an OTP."` — body2, muted
- `"Get OTP"` — button label
- `"Verify OTP"` — button label
- `"An OTP has been sent to {phoneNumber}. Please enter it below."` — body2

---

## VISUAL FOUNDATIONS

### Color System (Dark Theme — Material 3)
The app uses a **pure dark theme** as its primary mode. No light mode is implemented in the current codebase.

| Role | Value | Usage |
|---|---|---|
| Primary | `#863bff` / `#BB86FC` | Accent, active states, primary buttons |
| Primary (vivid) | `#7e14ff` | Logo inner highlight |
| Primary light | `#ede6ff` | Logo highlight shimmer |
| Secondary | `#03DAC6` | Secondary accents (defined, not yet used in screens) |
| Background | `#121212` | Full-viewport background |
| Surface (paper) | `#1E1E1E` | Cards, elevated surfaces |
| Text Primary | `#FFFFFF` | Headlines, body |
| Text Secondary | `#B0B0B0` | Helper text, muted labels |
| Error | MUI default `#f44336` | Error states, validation messages |
| Outline/Divider | MUI default `rgba(255,255,255,0.12)` | Input borders, dividers |

**Color vibe:** Rich deep purple on dark. The logo and primary color are a vivid violet-purple (`#863bff`). The overall palette is cool, dark, and focused — no warm tones. Backgrounds are near-black.

### Typography
- **Primary font:** **Geist** (variable, sans-serif) — intended as the main UI font per package dependencies. App.jsx currently declares `fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'` as a fallback (MUI default), but `@fontsource-variable/geist` is a declared dependency indicating intent to use Geist.
- **Monospace font:** **JetBrains Mono** (variable) — available for code, OTP fields, numeric inputs.
- **Type scale:** Material 3 scale via MUI:
  - `h4` / `h5` — Card titles (e.g., "Login with Phone")
  - `body1` — Standard paragraph text
  - `body2` — Helper text, muted instructions
  - `caption` — Small labels, timers
  - Button labels — MUI button text, all caps or sentence case per MUI default

### Spacing & Layout
- **Centered card layout** — primary screens use a flexbox-centered full-viewport container with a max-width card (400px).
- **Card padding:** `32px` (p: 4 in MUI = 32px)
- **Gap between form elements:** `24px` (gap: 3 in MUI = 24px)
- **Button padding:** `py: 1.5` = 12px vertical
- **Spacing unit:** MUI default = 8px

### Shape / Border Radius
- Cards: `border-radius: 16px` (borderRadius: 4 in MUI theme = 4×4 = 16px)
- Buttons: `border-radius: 16px`
- Text fields: `border-radius: 12px`
- OTP input cells: `border-radius: 8px`
- Logo icon: large corner radius (visually ~24px+ based on hero illustration)

### Shadows & Elevation
- Cards use MUI `boxShadow: 3` — a soft, diffuse dark shadow
- No custom shadow definitions; relies on MUI elevation system
- Logo uses internal glow/shimmer effects (filter + ellipse blur in SVG)

### Backgrounds & Surfaces
- **No images** used as backgrounds — pure solid colors
- Background: `#121212` (near-black)
- Surface: `#1E1E1E` (slightly lighter dark)
- **Hero image** exists (`assets/hero.png`) — an isometric 3D illustration of two stacked rounded squares/tablets, the lower one with a purple iridescent/holographic face. This is the brand illustration style.
- **No patterns or textures** in the current UI

### Animation & Motion
- MUI's default transitions (ripple effects on buttons, focus ring transitions)
- `tw-animate-css` is a dependency — utility-based CSS animations available
- No custom animation definitions found in current components
- **Loading states** use `CircularProgress` (MUI spinner) inside buttons

### Hover / Press States
- Buttons: MUI default hover overlay (slight lightening of background)
- Text buttons: MUI default (underline on hover)
- No custom hover overrides found

### Iconography
- **Primary icon library:** `@mui/icons-material` (Material Icons)
- **Secondary:** `lucide-react`
- Currently used: `PhoneIcon` from MUI in the phone input field
- Icons are inline inline SVG — no icon font
- Social icons exist in `assets/icons.svg` as SVG symbols: bluesky, discord, documentation, github, social, x

### Cards
- White-on-dark elevated card
- `borderRadius: 16px`
- `boxShadow: 3` (MUI elevation)
- `bgcolor: background.paper` (`#1E1E1E`)
- `maxWidth: 400px`, centered

### Corner Radii Summary
| Element | Radius |
|---|---|
| Cards | 16px |
| Buttons | 16px |
| Text fields | 12px |
| OTP cells | 8px |

---

## ICONOGRAPHY

### Approach
- **MUI Icons** (`@mui/icons-material`) is the primary icon library — Material Icons in filled style
- **Lucide React** is a secondary library (declared dependency, `lucide-react`)
- **No custom icon font** — icons are rendered as SVG via React components
- **SVG sprite** (`assets/icons.svg`) contains social/brand icons as `<symbol>` elements

### Icon Color
- Icons inherit from MUI's color system — typically `text.secondary` (`#B0B0B0`) or `primary` (`#BB86FC`) for active/accent states
- Documentation icon and social icon use `#aa3bff` (vivid purple stroke)
- Social brand icons (bluesky, discord, github, x) use `#08060d` (near-black fill)

### Available SVG Sprite Icons (`assets/icons.svg`)
- `#bluesky-icon` — Bluesky social
- `#discord-icon` — Discord
- `#documentation-icon` — Documentation (purple stroke)
- `#github-icon` — GitHub
- `#social-icon` — Generic social/user (purple stroke)
- `#x-icon` — X (Twitter)

### Usage
```html
<!-- SVG sprite usage -->
<svg><use href="assets/icons.svg#github-icon" /></svg>
```
```jsx
// MUI Icon usage
import PhoneIcon from '@mui/icons-material/Phone';
<PhoneIcon />

// Lucide usage
import { Phone } from 'lucide-react';
<Phone size={20} />
```

---

## FILES INDEX

```
README.md                    — This file; design system overview
SKILL.md                     — Agent skill definition
colors_and_type.css          — CSS custom properties for colors + typography
assets/
  logo.svg                   — BatchBook logo (lightning bolt, purple)
  icons.svg                  — SVG sprite: social icons (bluesky, discord, github, x, etc.)
  hero.png                   — Brand hero illustration (isometric 3D tablets, purple holographic)
preview/
  colors-primary.html        — Primary & brand color swatches
  colors-neutral.html        — Neutral / surface / background colors
  colors-semantic.html       — Semantic colors (error, success, etc.)
  type-display.html          — Display & headline type specimens
  type-body.html             — Body & label type specimens
  type-mono.html             — Monospace / code type specimens
  spacing-tokens.html        — Spacing scale tokens
  spacing-radii.html         — Border radius tokens
  spacing-elevation.html     — Shadow / elevation system
  components-buttons.html    — Button variants
  components-inputs.html     — Input field variants
  components-cards.html      — Card variants
  components-otp.html        — OTP input cluster
  brand-logo.html            — Logo display
  brand-icons.html           — Icon sprite showcase
ui_kits/
  batchbook-app/
    README.md                — UI kit overview
    index.html               — Interactive prototype (phone login → OTP → dashboard)
    PhoneLogin.jsx           — Phone login screen component
    OtpVerification.jsx      — OTP verification screen component
    Dashboard.jsx            — Dashboard placeholder component
    Theme.jsx                — MUI theme + shared styles
```
