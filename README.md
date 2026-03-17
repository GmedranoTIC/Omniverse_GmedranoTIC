# ⬡ GmedranoTIC's Omniverse Builder

A full-featured **3D world editor** that runs entirely in the browser — no install needed. Built for GitHub Pages.

## 🚀 Features

- **3D World Editor** — Place and position GLB models, images, text, and URL panels
- **First-Person Navigation** — WASD + mouse look, jump, sprint
- **Transform Gizmos** — Drag to move, rotate, scale objects directly in 3D
- **Collaborative** — Share a link; multiple users can be in the world at once
- **Voice Chat** — WebRTC-powered in-world voice chat
- **Export to HTML5** — Export your world as a self-contained HTML file for any website
- **Save/Load** — Download `.omni.json` project files and reload them
- **Environments** — Night, Sunset, Day, Space presets + custom sky/fog/ground colors
- **Password Protection** — Lock your shared room with a password
- **No download of GLBs** — Exported worlds display models without allowing download

## 🎮 Controls

| Key | Action |
|-----|--------|
| `W A S D` | Move |
| `Mouse` | Look around |
| `Space` | Jump |
| `Shift` | Run |
| `G` | Move mode |
| `R` | Rotate mode |
| `Delete` | Delete selected |
| `Ctrl+S` | Save project |
| `Esc` | Exit play mode |

## 📦 Deploy to GitHub Pages

1. Fork or upload this repo to GitHub
2. Go to **Settings → Pages → Source: main branch / root**
3. Your editor will be live at `https://yourusername.github.io/repo-name/`

## 🔗 Collaboration

1. Open the editor and click **Share**
2. Copy your **Share Link** and send it to collaborators
3. They open the link and click **Join** — they're now in your world!
4. Optional: set a **room password** for private spaces
5. Use the **🎙 Voice** button to enable in-world voice chat

> Collaboration uses BroadcastChannel API (same-origin/tabs) and can be extended with a WebRTC signaling server for cross-device use.

## 📁 Project Files

| File | Description |
|------|-------------|
| `index.html` | The complete editor (self-contained) |
| `README.md` | This file |

## 📝 Logo & Branding

All rights reserved — **GmedranoTIC's Omniverse Builder**
