# TabMaster

TabMaster is a small Firefox extension for quickly moving groups of tabs around.

## What it does

- **Copy all URLs** from tabs in your current Firefox window
- **Open tabs from a pasted list** of URLs, one per line

## How it works

Click the extension icon to open the popup.

From there you can:
- press **Copy current window tab URLs** to copy every tab URL in the current window
- paste a line-separated list of URLs and press **Open URLs** to open them as new tabs

## URL behavior

- Blank lines are ignored
- Duplicate URLs are preserved
- If a URL is missing only the protocol, TabMaster defaults it to `https://`
- If any non-blank line is invalid, nothing is opened

## Load in Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select this project's `manifest.json`

## Development

Run tests with:

```bash
npm test
```
