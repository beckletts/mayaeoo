# mayaeoo Rebuild — Handoff Notes

## Status: Rebuild complete, pending QA

The app has been fully rebuilt as React+Vite and the `rebuild` branch has been pushed to `beckletts/mayaeoo`. A preview deploy ran successfully via GitHub Actions (`deploy-preview.yml`). The app **won't load real data yet** because the three env var secrets haven't been added to GitHub, and the GAS backend hasn't been updated.

---

## What's done

- `rebuild` branch pushed to `beckletts/mayaeoo`
- Vite 5 + React 18 + React Router v6 (HashRouter)
- Pearson brand tokens, Plus Jakarta Sans font
- CalendarGrid, EventDot (turquoise/amethyst/fuchsia), MonthNav, EventModal
- FilterBar — type toggles, series dropdown, debounced search, all in URL params
- Cache-first data layer (localStorage, 2hr TTL) + stale-data banner
- Admin section — login gate, BulkImportPanel, DataTable, RowEditor, DeleteConfirm
- `gas/Code.gs` — new `doPost()`, `backfillIds()`, preserves existing `doGet()`
- GH Actions — `deploy.yml` (main→gh-pages) + `deploy-preview.yml` (rebuild→preview)
- Legacy files archived to `legacy/`

---

## What still needs doing before production

### 1. Update the GAS backend (15 min)
- Open the Google Sheet → Extensions → Apps Script
- Replace `Code.gs` with contents of `gas/Code.gs` from the repo
- Paste any existing sync functions back below the `// LEGACY` comment
- **Project Settings → Script Properties → Add:** `ADMIN_SECRET` = any strong secret string
- Select `backfillIds` function → Run once (adds UUIDs to column G of all existing rows)
- Deploy → Manage Deployments → New version → Deploy
- Copy the `/exec` deployment URL

### 2. Add GitHub repo secrets (5 min)
Go to `beckletts/mayaeoo` → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value |
|---|---|
| `VITE_GAS_URL` | GAS `/exec` URL from step above |
| `VITE_ADMIN_SECRET` | Same value as GAS Script Property `ADMIN_SECRET` |
| `VITE_ADMIN_PASSWORD` | Password for the admin UI login screen |

### 3. Optional: Test on Netlify first
- Connect `beckletts/mayaeoo` on Netlify, branch = `rebuild`
- Build command: `npm run build`, publish dir: `dist`
- Add the same 3 env vars above, plus `VITE_BASE_PATH` = `/`
- Netlify serves from root so base path must be `/` (not `/mayaeoo/`)

### 4. QA checklist
- [ ] Calendar loads events from GAS
- [ ] localStorage cache populates on second load
- [ ] Stale banner appears when GAS is unreachable
- [ ] `?type=vocational&series=Jun+25` URL pre-applies filters
- [ ] Search results list appears below grid when query is active
- [ ] ← → keys navigate months; Escape closes modal
- [ ] Webcal subscribe links work
- [ ] Admin login gate — wrong password rejected
- [ ] Bulk TSV paste → preview → append → rows appear in Sheet
- [ ] Row edit and delete round-trip correctly in Sheet

### 5. Merge to production
- Open PR: `rebuild` → `main`
- Merge — `deploy.yml` auto-triggers, deploys to `gh-pages` in ~30s
- Confirm Settings → Pages source is `gh-pages` branch

---

## Key files

| Path | Purpose |
|---|---|
| `gas/Code.gs` | Full GAS backend — copy this into the Apps Script editor |
| `src/lib/api.js` | GAS fetch/post wrappers (reads `VITE_GAS_URL`) |
| `src/lib/auth.js` | Admin session (reads `VITE_ADMIN_PASSWORD`) |
| `src/lib/cache.js` | localStorage cache, 2hr TTL |
| `src/lib/parseTSV.js` | TSV/CSV paste parser for bulk import |
| `src/hooks/useEvents.js` | Cache-first data hook with stale detection |
| `src/hooks/useFilters.js` | URL-param filter state + filtered event list |
| `.env.example` | Documents the three required env vars |
| `.github/workflows/deploy.yml` | Production deploy (main → gh-pages) |
| `.github/workflows/deploy-preview.yml` | Preview deploy (rebuild → gh-pages-preview) |

---

## Repo links
- Branch: `https://github.com/beckletts/mayaeoo/tree/rebuild`
- Actions: `https://github.com/beckletts/mayaeoo/actions`
- Open PR when ready: `https://github.com/beckletts/mayaeoo/compare/main...rebuild`
