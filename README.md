# AetherOS — Modern Web Desktop Simulation

A beautiful, fully interactive operating system simulation that runs entirely in the browser.  
Inspired by modern desktop environments, built from scratch with a fresh glassmorphism design.

**Works perfectly on GitHub Pages** — pure static files, no build step required.

![AetherOS](https://img.shields.io/badge/AetherOS-1.0-blue)  
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ready-success)  
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Lock screen** with live clock
- **Desktop** with icons, wallpaper, right-click context menu
- **Top panel** (Activities, clock, system indicators)
- **Modern dock** with hover animations and running indicators
- **App launcher** (Activities overview)
- **Full window management**
  - Drag to move
  - Resize from edges/corners
  - Minimize / Maximize / Close
  - Focus handling & cascading windows
- **Working applications**
  - 🌐 **Browser** — navigate to websites (with fallback when sites block iframes)
  - ▶️ **YouTube** — embed and play videos
  - 💻 **Terminal** — fully interactive with many commands (`help`, `neofetch`, `cowsay`, `open`, etc.)
  - 📁 **Files** — simple file manager
  - 🔢 **Calculator** — fully functional
  - 📝 **Notes** — autosaving notepad (localStorage)
  - ⚙️ **Settings** — change wallpapers
  - ℹ️ **About**
- **Keyboard shortcuts**
  - `Ctrl/Cmd + Space` → App launcher
  - `Escape` → Close launcher / context menu
- **Persistent wallpaper** choice
- **Toast notifications**
- **Responsive** design

## Live Demo

After deploying to GitHub Pages, your site will be available at:

```
https://<your-username>.github.io/<repo-name>/
```

## Deploy to GitHub Pages (2 minutes)

### Method 1 — New repository

1. Create a new repository on GitHub (e.g. `aetheros` or `webos`)
2. Upload **all files** from this folder (keep the structure)
3. Go to **Settings → Pages**
4. Under **Source**, select **Deploy from a branch**
5. Choose branch `main` (or `master`) and folder `/ (root)`
6. Click **Save**
7. Wait 1–2 minutes → your OS is live!

### Method 2 — From terminal

```bash
# Inside the webos folder
git init
git add .
git commit -m "AetherOS - Modern web desktop"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Then enable GitHub Pages as described above.

## Local Development

Just open `index.html` in a browser, or use any static server:

```bash
# Python
python -m http.server 8000

# Node
npx serve .

# VS Code Live Server, etc.
```

Then visit `http://localhost:8000`

## Project Structure

```
webos/
├── index.html          # Main entry
├── css/
│   └── style.css       # All custom styles
├── js/
│   ├── apps.js         # Application definitions & content
│   ├── window-manager.js
│   └── main.js         # Bootstrap & UI logic
├── assets/             # (optional icons/wallpapers)
└── README.md
```

## Tech Stack

- Pure HTML5 + CSS3 + Vanilla JavaScript
- Tailwind CSS (via CDN)
- Lucide Icons (via CDN)
- Google Fonts (Inter + JetBrains Mono)
- Unsplash wallpapers (CDN)

No frameworks, no build tools, no dependencies to install.

## Customization

- **Add new apps**: Edit `js/apps.js` — add an entry to the `APPS` object and create a content function.
- **Change default wallpaper**: Edit the `style` attribute on `#wallpaper` in `index.html` or use Settings.
- **Dock / Desktop icons**: Modify `DOCK_APPS` and `DESKTOP_ICONS` arrays in `apps.js`.
- **Theme colors**: Adjust the Tailwind config in `index.html` or `css/style.css`.

## Notes about Google / YouTube

Many major sites (Google, YouTube, etc.) set `X-Frame-Options` or CSP headers that prevent them from being embedded in iframes.  

AetherOS handles this gracefully:
- The Browser app shows a clear message + “Open in new tab” button when embedding is blocked.
- The dedicated YouTube app uses the official YouTube embed player, which **does** work.
- You can still browse sites that allow embedding (Wikipedia, MDN, example.com, most documentation sites, etc.).

## License

MIT — feel free to use, modify, and deploy as your own portfolio or project.

---

Built with ❤️ as a modern take on web-based desktop simulations.
