(() => {
  if (globalThis.__crushYourConnectionsInjecting) return;
  globalThis.__crushYourConnectionsInjecting = true;
  import(chrome.runtime.getURL('content.js')).catch((err) => {
    console.error('Crush Your Connections failed to load', err);
  });
})();
