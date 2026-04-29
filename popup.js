import { parseAndValidateUrls } from './src/url-utils.js';

const extensionApi = globalThis.browser ?? globalThis.chrome;

const copyButton = document.querySelector('#copy-tabs-button');
const openButton = document.querySelector('#open-urls-button');
const urlInput = document.querySelector('#url-input');
const statusMessage = document.querySelector('#status-message');

copyButton.addEventListener('click', () => {
  void handleCopyUrls();
});

openButton.addEventListener('click', () => {
  void handleOpenUrls();
});

async function handleCopyUrls() {
  setBusy(true);
  clearStatus();

  try {
    const tabs = await extensionApi.tabs.query({ currentWindow: true });
    const urls = tabs
      .map((tab) => (typeof tab.url === 'string' ? tab.url.trim() : ''))
      .filter(Boolean);

    if (urls.length === 0) {
      setStatus('No tab URLs available to copy.', 'error');
      return;
    }

    await copyTextToClipboard(urls.join('\n') + '\n');
    setStatus(`Copied ${urls.length} URL${urls.length === 1 ? '' : 's'}.`, 'success');
  } catch {
    setStatus('Failed to copy URLs to clipboard.', 'error');
  } finally {
    setBusy(false);
  }
}

async function handleOpenUrls() {
  setBusy(true);
  clearStatus();

  try {
    const parsed = parseAndValidateUrls(urlInput.value);

    if (!parsed.ok) {
      setStatus(parsed.message, 'error');
      return;
    }

    const currentWindow = await extensionApi.windows.getCurrent();
    let openedCount = 0;

    for (const url of parsed.urls) {
      await extensionApi.tabs.create({
        windowId: currentWindow.id,
        url,
        active: false,
      });
      openedCount += 1;
    }

    setStatus(`Opened ${openedCount} tab${openedCount === 1 ? '' : 's'}.`, 'success');
  } catch {
    setStatus('Failed to open one or more tabs. A partial open may have occurred.', 'error');
  } finally {
    setBusy(false);
  }
}

function setBusy(isBusy) {
  copyButton.disabled = isBusy;
  openButton.disabled = isBusy;
}

function clearStatus() {
  statusMessage.textContent = '';
  statusMessage.className = 'status-message';
}

function setStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const temporaryTextArea = document.createElement('textarea');
  temporaryTextArea.value = text;
  temporaryTextArea.setAttribute('readonly', '');
  temporaryTextArea.style.position = 'absolute';
  temporaryTextArea.style.left = '-9999px';

  document.body.appendChild(temporaryTextArea);
  temporaryTextArea.select();

  const success = document.execCommand('copy');

  document.body.removeChild(temporaryTextArea);

  if (!success) {
    throw new Error('Clipboard copy failed');
  }
}
