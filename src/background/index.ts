import type { ExtensionMessage } from '../types/extension';

const scripts: chrome.scripting.RegisteredContentScript[] = [
  {
    id: 'paste-script',
    js: ['content-scripts/paste.js'],
    persistAcrossSessions: true,
    matches: [
      'https://portal.facturaelectronica.sat.gob.mx/*',
      'https://*.clouda.sat.gob.mx/*',
    ],
    runAt: 'document_idle',
    world: 'MAIN',
    allFrames: true,
  },
  {
    id: 'autocomplete-script',
    js: ['content-scripts/autocomplete.js'],
    persistAcrossSessions: true,
    matches: [
      'https://portal.facturaelectronica.sat.gob.mx/Factura/GeneraFactura*',
    ],
    runAt: 'document_start',
    world: 'MAIN',
    allFrames: true,
  },
  {
    id: 'no-frecuent-hide-reload-script',
    js: [
      'content-scripts/utils.js',
      'content-scripts/no-frecuent.js',
      'content-scripts/hide.js',
      'content-scripts/reload.js',
    ],
    persistAcrossSessions: true,
    matches: [
      'https://portal.facturaelectronica.sat.gob.mx/Factura/GeneraFactura*',
    ],
    runAt: 'document_idle',
    world: 'ISOLATED',
    allFrames: true,
  },
  {
    id: 'invoice-data-script',
    js: [
      'content-scripts/utils.js',
      'content-scripts/invoice-data.js',
    ],
    persistAcrossSessions: true,
    matches: [
      'https://portal.facturaelectronica.sat.gob.mx/Factura/GeneraFactura*',
    ],
    runAt: 'document_idle',
    world: 'ISOLATED',
    allFrames: true,
  },
  {
    id: 'hide',
    js: [
      'content-scripts/utils.js',
      'content-scripts/hide.js',
    ],
    persistAcrossSessions: true,
    matches: [
      'https://portal.facturaelectronica.sat.gob.mx/*',
    ],
    runAt: 'document_idle',
    world: 'ISOLATED',
    allFrames: true,
  },
  {
    id: 'constancia-script',
    js: ['content-scripts/constancia.js'],
    persistAcrossSessions: true,
    matches: [
      'https://*.sat.gob.mx/operacion/53027/genera-tu-constancia-de-situacion-fiscal.',
    ],
    runAt: 'document_idle',
    world: 'ISOLATED',
    allFrames: true,
  },
];

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ enabled: true }, () => {
      console.log('Configuración inicial guardada.');
    });
  }
  chrome.scripting.registerContentScripts(scripts);
});

// Escuchar mensajes del popup
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.action === 'getState') {
    chrome.storage.local.get(['enabled'], result => {
      const isEnabled = result.enabled ?? true;
      sendResponse({ enabled: isEnabled });
    });
    return true;
  } else if (message.action === 'setState' && message.enabled !== undefined) {
    chrome.storage.local.set({ enabled: message.enabled }, () => {
      chrome.storage.local.get(['enabled'], result => {
        chrome.scripting.getRegisteredContentScripts(registeredScripts => {
          if (result.enabled) {
            if (!registeredScripts || registeredScripts.length === 0) {
              chrome.scripting.registerContentScripts(scripts);
            }
          } else {
            const unregisterScripts = {
              ids: scripts.map(({ id }) => id),
            };
            chrome.scripting.unregisterContentScripts(unregisterScripts);
          }
        });
      });
    });
    return true;
  }
});
