# BatchbookUI Design System

This document outlines the design philosophy, color scheme, typography, and component styles for the BatchbookUI project. The goal is to create a modern, simple, and consistent user experience.

## Design Philosophy: Focused Clarity

Our design philosophy, "Focused Clarity," prioritizes ease of use and a clear, uncluttered interface. We aim to guide the user through the login process with minimal friction.

-   **Minimalism:** We use a minimal color palette and simple, geometric shapes to keep the focus on the task at hand.
-   **Clarity:** Visual hierarchy is important. Key actions and information are given prominence through color, size, and placement.
-   **Feedback:** The UI provides clear feedback for user interactions, including loading states, validation errors, and success messages.
-   **Modern Aesthetic:** We embrace modern design trends like dark mode, subtle gradients, and soft shadows to create a visually appealing experience.

## Color Scheme

We use the Oklch color space for a consistent and perceptually uniform color palette. The palette is designed for a dark theme.

### Primary Colors
-   `--background`: `oklch(0.08 0 0)` - The darkest background color.
-   `--foreground`: `oklch(0.985 0 0)` - The primary text color.
-   `--card`: `oklch(0.12 0 0)` - The background color for card elements.
-   `--primary`: `oklch(0.7 0.15 250)` - The main accent color for interactive elements.
-   `--primary-foreground`: `oklch(1 0 0)` - Text color for elements with a primary background.

### Secondary & Muted Colors
-   `--secondary`: `oklch(0.2 0 0)` - A secondary background color.
-   `--muted-foreground`: `oklch(0.6 0 0)` - For less important text.

### Semantic Colors
-   `--destructive`: `oklch(0.6 0.25 27)` - For error states and destructive actions.
-   `--success`: `oklch(0.7 0.2 150)` - For success states. (New)
-   `--warning`: `oklch(0.8 0.2 85)` - For warnings. (New)
-   `--info`: `oklch(0.8 0.15 230)` - For informational messages. (New)

### UI Element Colors
-   `--border`: `oklch(0.2 0 0)` - For borders.
-   `--input`: `oklch(0.2 0 0)` - For input backgrounds.
-   `--ring`: `oklch(0.7 0.15 250 / 0.5)` - For focus rings.

## Typography

We use the `Geist Variable` font for all text. The typographic scale is designed to create a clear visual hierarchy.

-   **h1 (Page Title):** `3xl` (36px), `font-bold`, `tracking-tight`. Often uses `gradient-text`.
-   **h2 (Card Title):** `2xl` (24px), `font-bold`.
-   **Body Text:** `base` (16px), `text-muted-foreground`.
-   **Input Text:** `lg` (18px).
-   **Button Text:** `base` (16px), `font-semibold`.
-   **Labels:** `sm` (14px), `font-medium`, `text-white/70`.
-   **Small Text/Captions:** `xs` (12px), `text-muted-foreground`.

## Component Design

Components should be built with reusability and consistency in mind.

### Cards (`.modern-card`)

-   **Appearance:** A glass-like card with a subtle background gradient and a 1px border.
-   **Border:** `1px solid rgba(255, 255, 255, 0.1)`
-   **Border Radius:** `var(--radius-2xl)` (1.5rem)
-   **Padding:** `2rem`
-   **Box Shadow:** `0 25px 50px -12px rgba(0, 0, 0, 0.5)`

### Buttons

-   **Primary Button:** Uses the `--primary` color. Has a subtle scale transition on hover and press.
-   **Secondary/Link Button:** Plain text with a color change on hover. Used for less prominent actions like "Resend OTP" or "Sign out".
-   **Loading State:** The button should display a spinner and a relevant message, and be disabled.

### Input Fields

-   **General:** Dark background (`bg-white/5`), light border (`border-white/10`), and larger text for readability.
-   **Focus State:** The border color should change to the primary color (`focus:border-primary/50`) and the background should become slightly lighter (`focus:bg-white/10`).
-   **Validation:** Invalid fields should have a destructive border color.

### Icons

-   Use icons from the `lucide-react` library to maintain a consistent, clean style.
-   Icons should be used sparingly to support content, not as decoration.
