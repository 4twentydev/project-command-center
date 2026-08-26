# ThinkPad P14s Operator Setup Guide

## 1. Local Development Environment
1. Ensure **Bun** (v1.3+) is installed:
   ```powershell
   bun --version
   ```
2. Clone the authoritative repository:
   ```powershell
   git clone git@github.com:rivetworks/yorkstead-website.git "C:\Users\4twen\OneDrive\Documents\ChatGPT\yorkstead\yorkstead-website"
   cd "C:\Users\4twen\OneDrive\Documents\ChatGPT\yorkstead\yorkstead-website"
   bun install
   ```
3. Start the local server:
   ```powershell
   bun dev
   ```

## 2. Progressive Web App (PWA) Installation
1. Open `http://localhost:3000/dashboard` or `https://yorkstead.com/dashboard` in Microsoft Edge.
2. Click the **App available** icon in the address bar (or menu `...` -> **Apps** -> **Install Yorkstead**).
3. The standalone window provides full biometric passkey authentication via Windows Hello.
