# Operator Access & Quick Launcher Guide

WORK//CTRL provides direct, zero-friction operator access to the private Command Center from both your **ThinkPad P14s (Windows 11)** and **OnePlus (Android)** devices without having to divert through the public studio site.

---

## 1. Instant Passkey Biometrics Flow

When you click the **Command Center** button anywhere on the site:
- The system immediately triggers the native WebAuthn biometric challenge with zero extra clicks.
- **On ThinkPad**: Windows Hello immediately prompts for your fingerprint / PIN.
- **On OnePlus**: Android biometrics immediately prompts for your fingerprint.
- Upon fingerprint verification, you are immediately routed directly into `/dashboard`.
- If passkey authentication is canceled or if you need recovery password access, the login panel remains visible with the email/password fields ready.

---

## 2. Direct Access on ThinkPad P14s (Windows 11)

### Option A: Install as Dedicated Desktop App (Recommended)
1. Open Microsoft Edge or Google Chrome.
2. Navigate directly to `https://www.4twenty.dev/dashboard` (or `http://localhost:3000/dashboard` for local development).
3. In Edge: Click the **App available** icon in the address bar (or click `...` -> **Apps** -> **Install WORK//CTRL**).
   In Chrome: Click `⋮` -> **Cast, save, and share** -> **Install page as app**.
4. Check **Pin to taskbar** and **Pin to Start**.
5. Opening this app launches Command Center in its own standalone, clean window, immediately triggering Windows Hello fingerprint sign-in.

### Option B: Native Desktop / Taskbar Shortcut Target
You can create a custom Windows shortcut pointing directly to the app window:
- **Production Target**:
  ```cmd
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=https://www.4twenty.dev/dashboard
  ```
- **Local Dev Target**:
  ```cmd
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000/dashboard
  ```

### Option C: Direct Quick URL Aliases
Type either alias into your browser address bar:
- `4twenty.dev/cmd`
- `4twenty.dev/ctrl`

---

## 3. Direct Access on OnePlus (Android)

### Option A: Install Progressive Web App (PWA) to Home Screen
1. Open Google Chrome, Brave, or Edge on your OnePlus phone.
2. Navigate to `https://www.4twenty.dev/dashboard` (or `https://www.4twenty.dev/cmd`).
3. Tap the browser menu (`⋮`) in the top right.
4. Select **Add to Home screen** or **Install app**.
5. Tap **Add** / **Install**.
6. An app icon for **WORK//CTRL** will appear on your OnePlus home screen / app drawer.

### Option B: 1-Tap Home Screen Launcher & App Shortcuts
- **Direct Launch**: Tapping the home screen icon opens the Command Center in full-screen standalone mode and immediately activates the fingerprint prompt. Tap your finger on the OnePlus fingerprint sensor and you are instantly on your dashboard.
- **App Shortcuts (Long Press)**: Long-press the WORK//CTRL home screen icon to reveal direct jump shortcuts:
  - **Command Center** (`/dashboard`)
  - **Client Leads** (`/dashboard/leads`)
  - **Consultations** (`/dashboard/consultations`)
  You can drag any of these shortcuts directly onto your home screen for 1-tap dedicated entry into specific workflows.

---

## 4. Managing Registered Passkeys

To enroll new hardware keys or manage existing devices:
1. Sign in and visit `/account` (or select **Account & passkeys** in the Command Center).
2. Click **Add passkey** to enroll your device biometric (Windows Hello / OnePlus Fingerprint).
3. Always ensure at least one primary biometric key and one backup/recovery credential exist before removing an old passkey.
