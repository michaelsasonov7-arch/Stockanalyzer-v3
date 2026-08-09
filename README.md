# 🐻 Stock Analyzer Pro

A single-file, client-side stock analysis tool for US equities — fundamental + technical scoring, entry/stop/target calculation, a watchlist with price alerts, and Telegram push notifications. No backend, no build step: it's one `index.html` you can open directly, deploy to GitHub Pages, or wrap as an installable PWA / Android APK.

> **Educational use only. Not financial advice.** This tool is built to support your own analysis, not replace it — always confirm with your own research before trading.

---

## Features

- **91-point scoring system** — 48 fundamental points (P/E, ROE, D/E, margins, growth, earnings quality) + up to 43 technical points (RSI, moving averages, ATR, relative strength vs. sector/SPY, Fibonacci zones). The technical max drops to 40 automatically when sector relative-strength data isn't available for a ticker — the app always shows you the real denominator, not a fixed one.
- **Multi-source data fallback chain** — tries Finnhub → Twelve Data → FMP → Polygon → Alpha Vantage → Yahoo Finance (no key required) → Stooq (no key required), in that order, so the app still works even with zero API keys configured.
- **Optional premium sources** — Tiingo, EODHD, Alpaca, and Intrinio slot into the fallback chain if you add a key; Nasdaq Data Link and Databento are wired for connection testing today.
- **Entry/Stop/Target calculator** — three entry styles (Short-Term breakout, Medium-Term pullback, Ideal/deep pullback), ATR-based stop placement (Wilder's smoothing), and 1:1.5 / 1:2.5 / 1:4.0 risk/reward targets.
- **Iron Rule position sizing** — shows exact share count for 1%/2%/3% account risk, with a liquidity warning if the position would be a large slice of average daily volume.
- **Watchlist with live alerts** — tracks entry/stop/target hits, checks every 60 seconds, and can push to your device via the browser Notification API and/or Telegram.
- **Sector-aware fundamentals** — thresholds for D/E, ROE, and P/E adjust per sector (e.g., REITs and utilities aren't penalized for debt levels that are normal for their industry; banks skip the Current Ratio / Gross Margin checks entirely, since those metrics aren't meaningful for financials).
- **Macro context** — VIX level + SPY trend classify the current regime (risk-on / risk-off / neutral) and adjust the Opportunity Score accordingly.
- **Trade journal & CSV export** — completed trades log automatically; the whole watchlist exports to CSV.
- **PWA-installable** — add to home screen on iOS/Android for an app-like experience, with offline app-shell caching via a service worker.

## Screenshots

*(Add screenshots here — drag images into this section on GitHub, or reference `docs/screenshot-*.png` if you add a `docs/` folder.)*

---

## Getting Started

### Option A — Just open it
Download `index.html` and open it in any modern browser. Yahoo Finance and Stooq work with **zero configuration** — no API key needed to get a working analysis.

### Option B — Deploy to GitHub Pages
1. Push all the files in this repo (`index.html`, `manifest.json`, `sw.js`, `icons/`) to a GitHub repository.
2. In the repo settings, enable **GitHub Pages** → deploy from the branch root (or `/docs` if you move files there — just make sure `manifest.json`, `sw.js`, and `icons/` stay in the same folder as `index.html`, since all paths are relative).
3. Visit the published URL. On mobile, use "Add to Home Screen" to install it as a PWA.

### Option C — Wrap as an Android APK
The app is a single static HTML file, which makes it compatible with WebView-wrapper tools (e.g. AppMint, PWABuilder, Median). Point the wrapper at your deployed GitHub Pages URL.

> **Known WebView limitation:** some WebView wrappers isolate `localStorage` per origin differently than a normal mobile browser. If API keys entered in your phone's browser don't appear inside the wrapped app, re-enter them directly inside the app.

---

## Adding API Keys (optional, but unlocks more data)

Open **Settings** inside the app. All keys are stored **locally in your browser's `localStorage`** — nothing is ever sent to any server other than the data provider itself (and, for the free Yahoo/Stooq fallback only, through a public CORS proxy — see [Security Notes](#security-notes) below). Use the 👁 button next to any key field to verify what you typed.

| Provider | Free tier? | Used for |
|---|---|---|
| [Finnhub](https://finnhub.io) | Yes | Fundamentals, profile, earnings, price target/recommendation |
| [Twelve Data](https://twelvedata.com) | Yes | RSI/MA/ATR technical indicators |
| [FMP](https://financialmodelingprep.com) | Yes (limited) | Fundamentals, ratios |
| [Polygon](https://polygon.io) | Yes (limited) | Price data |
| [Alpha Vantage](https://www.alphavantage.co) | Yes | Fallback for gross margin, FCF, technicals |
| Yahoo Finance | No key needed | Primary free fallback for price/technicals |
| Stooq | No key needed | Secondary free fallback |
| Tiingo / EODHD / Alpaca / Intrinio | Paid | Optional premium fallback tier |
| Nasdaq Data Link / Databento | Paid | Connection test only (not yet in the analysis pipeline) |

**Telegram alerts** (optional): create a bot via [@BotFather](https://t.me/BotFather), get your chat ID, and enter both in Settings → Telegram. Use "Test" to confirm before relying on it for watchlist alerts.

---

## How the Score Works

- **Fundamental (48 pts, fixed):** EPS positivity & growth, revenue growth, net income growth, D/E, free cash flow, ROE, current ratio, P/E, gross margin, earnings surprise history.
- **Technical (40–43 pts, variable):** RSI (daily + weekly), price vs. MA50/MA200, ATR-based volatility context, 52-week range position, relative strength vs. SPY, and — when sector ETF data is available — relative strength vs. sector (+3 pts).
- **Verdict bands:** 80+ = Strong Setup · 65+ = Possible Setup · 45+ = Monitor Only · below = Not Recommended.
- **Opportunity Score (0–100, separate metric):** an independent read on setup quality that doesn't gate the main score — useful for comparing *how good* a "Monitor Only" stock's setup is relative to another.

## Risk & Position Sizing

The **Iron Rule calculator** (in the Position Size tab) shows share count for 1%, 2%, and 3% account risk given your entry and stop, with the 2%/"Balanced" row generally recommended unless your chosen scoring mode says otherwise. It also flags when your position size would represent a meaningful share of the stock's average daily volume (a real slippage risk on smaller-cap names).

---

## Tech Stack

Vanilla JavaScript, no framework, no build step, no dependencies beyond what's loaded via CDN (TradingView widget for the chart). Everything — UI, data fetching, scoring logic, alert engine — lives in one `index.html`.

## Security Notes

- API keys are stored in browser `localStorage`, unencrypted. Anyone with access to your device/browser profile (or a browser extension with storage access) could read them. Don't use a key tied to a payment method you're not comfortable exposing to that risk, and treat this the way you'd treat any client-only app that stores secrets locally.
- **Only the free Yahoo Finance / Stooq fallback (which requires no API key at all) is routed through public CORS proxies** (`allorigins.win`, `corsproxy.io`, `api.codetabs.com`, `thingproxy.freeboard.io`), because those sources block direct browser requests. **Paid API keys (Finnhub, Twelve Data, FMP, etc.) are never sent through any proxy** — those calls go straight to the provider.
- The disclaimer screen is shown on every session by design (no "remember me" option) — this was a deliberate choice carried over from an earlier version, most likely for compliance reasons around presenting the risk disclosure. If you maintain a fork and want to change this, see the `enterApp()` function.

## Known Limitations

- No backend means no server-side secret storage, no cross-device sync, and no historical backtesting beyond what each API's free tier exposes.
- Two watchlist data models coexist internally (`trade` — legacy single-position tracking, and `alerts[]` — newer multi-scenario tracking) for backward compatibility with data saved by older versions. Both are actively maintained; this is an internal implementation detail, not a bug.
- `manifest.json` / `sw.js` / `icons/` must be deployed alongside `index.html` in the same folder — if you move `index.html` without them, the PWA install prompt and service worker registration will fail silently (the app itself still works fine as a plain web page).

## Contributing / Forking

This is a single-author project maintained as one HTML file by design (easy to audit, easy to self-host, no build pipeline to trust). If you fork it:
- Keep `SECTOR_THRESHOLDS`, the scoring weights in `scoreChecks()`, and the R/R multipliers (1.5× / 2.5× / 4.0×) in sync if you change one — they're referenced from several places.
- Bump the cache name in `sw.js` (`CACHE_NAME`) whenever you change `index.html`, or returning users may get served a stale cached copy.

## License

*(Add your license here — e.g. MIT, or "All rights reserved" if you don't want to open it up.)*

## Disclaimer

Stock Analyzer Pro is provided for educational purposes only. It is not financial advice, and nothing it outputs (scores, entries, stops, targets) is a recommendation to buy or sell any security. Markets carry risk of loss. Do your own research and consult a licensed financial advisor before making investment decisions.
