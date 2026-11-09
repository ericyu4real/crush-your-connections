# Crush Your Connections

A Manifest V3 Chrome extension that fills LinkedIn Zip or Queens when you click **Crush**.

It picks the solver from the page URL (`/games/zip` or `/games/queens`), reads the board from the live DOM (not a screenshot), solves locally, then clicks the real cells. Nothing is sent off your machine.

It does not fill anything until you click Crush.

## Install (load unpacked)

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select the `extension` folder in this project.
4. Pin **Crush Your Connections** if you want it on the toolbar.
5. Reload the Zip or Queens tab, or reopen the popup — it will attach itself if the tab was already open.
6. If it still misses the board, click **Debug** in the popup and paste that text instead of a screenshot.

## How to use

1. Open [LinkedIn Zip](https://www.linkedin.com/games/zip/) or [LinkedIn Queens](https://www.linkedin.com/games/queens/) and start the game.
2. A small detector appears in the top-right when it finds an N×N board. You can also click the toolbar icon.
3. Click **Crush**.

## Tests

```bash
npm install
npm test
```

## Project layout

```
extension/
  detect.js          # Zip vs Queens from URL, then board
  zip/               # Zip solver + DOM
  queens/            # Queens solver + DOM
  content.js         # isolated world: detector + popup bridge
  page.js            # MAIN world command bus (CSP may block this)
tests/
```
