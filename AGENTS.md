# AGENTS.md

## What this repository is
This is a small Firefox WebExtension called **TabMaster**.

It has two user-facing features:
- copy the URLs of all open tabs in the current window
- open tabs from a pasted line-separated list of URLs

The extension uses a popup UI and intentionally keeps the architecture minimal.

## Project layout
- `manifest.json` — Firefox extension manifest
- `popup.html` — popup markup
- `popup.css` — popup styling
- `popup.js` — popup event handlers and browser API integration
- `src/url-utils.js` — URL parsing, normalization, and validation logic
- `tests/url-utils.test.js` — unit tests for parsing/validation behavior
- `README.md` — basic usage and development notes
- `plan.md` — product/implementation plan that drove the initial build

## Key implementation details

### Popup behavior
`popup.js` is the main runtime entrypoint for the extension UI.

It handles:
- copying current-window tab URLs to the clipboard
- validating pasted URLs before opening any tabs
- opening tabs in the current window
- status/error messaging

### URL validation rules
Most URL behavior is centralized in `src/url-utils.js`.

Current rules:
- split input by line
- trim whitespace
- ignore blank lines
- preserve duplicates and order
- if a URL is missing only its scheme, normalize it to `https://...`
- if any non-blank line is invalid, block the whole open action

Important: this is intentionally **all-or-nothing** validation.

## Conventions to preserve
- Keep the code simple and dependency-light.
- Prefer plain JavaScript over adding tooling unless there is a clear need.
- Reuse `src/url-utils.js` for URL logic instead of duplicating parsing rules in `popup.js`.
- Preserve user-visible behavior from `plan.md` unless explicitly changing requirements.
- Keep popup UX straightforward: clear success/error messages, minimal friction.

## Testing
Run tests with:

```bash
npm test
```

Current tests cover URL parsing and validation logic only.

If you change:
- URL normalization rules
- line parsing behavior
- all-or-nothing validation behavior

then update `tests/url-utils.test.js` accordingly.

## Firefox-specific notes
- The extension currently uses **Manifest V3**.
- Browser APIs are accessed via `globalThis.browser ?? globalThis.chrome` in `popup.js`.
- Clipboard behavior may vary across environments; keep fallback behavior intact unless replacing it with a clearly more reliable approach.
- Some Firefox/internal tabs may not expose normal URLs; copy behavior should remain graceful in those cases.

## Common change guidance

### If adding new popup functionality
- Start in `popup.html` for UI
- style in `popup.css`
- wire behavior in `popup.js`
- move non-UI logic into `src/` if it grows beyond trivial size

### If changing URL handling
- update `src/url-utils.js`
- add or adjust tests first or alongside the change
- make sure the final behavior still matches product intent

### If changing manifest permissions
- keep requested permissions minimal
- document why the new permission is required

## Things to avoid
- Don’t introduce a framework/build step without a strong reason.
- Don’t silently weaken validation; the current product behavior requires blocking the whole open action on invalid input.
- Don’t deduplicate URLs unless requirements change.
- Don’t broaden behavior from current-window scope unless explicitly requested.

## Good verification steps after changes
At minimum:
- run `npm test`

If popup behavior changes, also recommend manual Firefox verification via temporary add-on loading from `manifest.json`.
