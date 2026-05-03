# BatchBook App — UI Kit

An interactive click-through prototype of the BatchBook app's core authentication and dashboard flows.

## Screens
1. **Phone Login** (`/`) — Phone number input with validation, loading state, and OTP dispatch
2. **OTP Verification** (`/otp-verification`) — 6-cell OTP input with focus management, paste support, countdown resend timer
3. **Dashboard** (`/dashboard`) — Stats grid, batch list, bottom navigation, app bar

## Components
| File | Description |
|---|---|
| `index.html` | Main interactive prototype (all components inlined) |
| `PhoneLogin.jsx` | Phone login screen (standalone JSX reference) |
| `OtpVerification.jsx` | OTP verification screen (standalone JSX reference) |
| `Dashboard.jsx` | Dashboard screen (standalone JSX reference) |
| `Theme.jsx` | Shared design tokens |

## Design System
- **Colors:** Material 3 dark theme — primary `#BB86FC`, background `#121212`, surface `#1E1E1E`
- **Type:** DM Sans (Geist fallback) + JetBrains Mono for code/OTP
- **Radius:** Cards 16px, inputs 12px, OTP cells 8px
- **Icons:** Inline SVG (Lucide-style), LogoMark inlined from `assets/logo.svg`

## How to use
Open `index.html` in a browser. Use the left panel to jump between screens, or interact with the prototype directly (fill phone → get OTP → verify → dashboard).

> **Note:** This is a visual prototype only. Firebase auth is not wired up — any 10-digit phone number and any OTP except `000000` will proceed.
