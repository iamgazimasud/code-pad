# Code Pad

A code editor for your phone, laid out like VS Code. Write JavaScript, Python and HTML with suggestions and error checks, then run your code. Install it to your home screen and it works offline.

It's one HTML file of vanilla JavaScript. No framework, no build step.

## What it does

- **Workbench**: the VS Code layout. A title bar with the command center, the activity bar (Explorer, Search, Settings) down the left, editor tabs, breadcrumbs, a bottom panel with Problems, Terminal and Preview, and the blue status bar. With no editor open, the editor area shows a Welcome page with New File…, Open File… and your recent files.
- **Your files only**: a new workspace starts empty. A file exists because you made it (New File… asks for its name first, and nothing is created until you press Enter) or opened it from your device (Open File…). Closing the last tab goes back to the Welcome page; deleting the last file leaves the workspace empty.
- **Editor**: syntax highlighting, bracket pair colors, indent guides, autocomplete with snippets, inline errors, find and replace, a command palette, and multiple files in tabs. Files save in your browser automatically. Typing uses the phone's own keyboard and nothing else.
- **Runs your code**:
  - **JavaScript** runs in a Web Worker, with output in the terminal.
  - **Python** runs for real with [Pyodide](https://pyodide.org) 0.26 (Python 3.12) in a Web Worker. Output streams as your program prints. The first run downloads Python (about 10 MB) and shows "Loading Python…"; after that it's cached and works offline.
  - **HTML** renders in a sandboxed live preview.
  - Code that loops forever is stopped after 5 seconds.
- **Pinch to zoom**: pinch the editor with two fingers to change the text size. The page itself never zooms.
- **Installable app**: a web app manifest, icons (including a maskable one) and a service worker. Add it to your home screen and it opens full screen, even with no connection.

## Install it on your phone

- **iPhone (Safari)**: open the site, tap Share, then **Add to Home Screen**.
- **Android (Chrome)**: open the site, tap the menu, then **Install app** (or **Add to Home screen**).

## Limits

- Python's `input()` can't read typing yet, because the terminal only shows output. Code that calls it gets a friendly message suggesting you put the value in the code instead.
- C, C++ and Java get highlighting, suggestions and error checks, but the browser can't run them.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole app: markup, styles and script |
| `manifest.webmanifest` | App name, colors and icons for installing |
| `sw.js` | Service worker: caches the app, and the font, parser and Python files after their first download |
| `icons/` | App icons: 192 and 512 px, a maskable 512 px, the Apple touch icon, and an SVG |
| `vercel.json` | Static hosting on Vercel, no build |

## Where it lives

The app's address is **[gazimasud.com/code-pad](https://gazimasud.com/code-pad)**. The website forwards `/code-pad` and everything under it to this project's Vercel deployment (a rewrite in the website's `next.config.ts`), so every URL in the app is absolute and starts with `/code-pad`. This project's own domain serves the app at `/code-pad` too, and its root redirects there (see `vercel.json`).

The first time someone opens it on a phone where they used the old code pad, files they wrote there come across into this one. Earlier versions of this app put three sample files (`hello.js`, `fizzbuzz.py`, `counter.html`) into every new workspace; copies nobody edited are removed on the first visit after the update.

## Run it locally

The app expects to be served at `/code-pad` over HTTP. The service worker and the workers need a real origin, not `file://`.

```bash
mkdir -p /tmp/site && ln -sfn "$PWD" /tmp/site/code-pad && python3 -m http.server 8000 -d /tmp/site
```

Then open http://localhost:8000/code-pad/.

## Deploy

It's a static site with no build. Each push to `main` redeploys the Vercel project, and gazimasud.com/code-pad shows the new version straight away. To deploy from the command line instead:

```bash
npx vercel --prod
```

After changing `index.html`, installed copies update on their next launch. The service worker serves the cached app straight away and fetches the new version in the background.
