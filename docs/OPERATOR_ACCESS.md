# Operator Access & Biometric Authentication

Yorkstead Systems provides direct, zero-friction operator access to the private Command Center from both **ThinkPad (Windows 11)** and **Android** mobile devices.

---

## 1. Desktop Operator Launcher (Windows 11)

### Microsoft Edge PWA Installation
1. Navigate to `https://yorkstead.com/dashboard` (or `http://localhost:3000/dashboard` locally).
2. Click **App available** in the URL bar to install the web app.
3. Windows Hello will securely prompt for fingerprint or facial recognition upon navigation.

### Direct Shortcut Command
```powershell
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=https://yorkstead.com/dashboard
```

---

## 2. Mobile Operator Access (Android)

1. Open Chrome on Android and browse to `https://yorkstead.com/dashboard`.
2. Tap menu `⋮` -> **Add to Home screen** -> **Install**.
3. Biometric passkeys (fingerprint / screen lock) enable instant sign-in.
4. Fast jump shortcuts (`yorkstead.com/cmd`, `yorkstead.com/ctrl`) navigate directly to the operator command center.
