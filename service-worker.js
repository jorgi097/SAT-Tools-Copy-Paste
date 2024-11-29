// Activar al instalarse
chrome.runtime.onInstalled.addListener(details => {
    chrome.storage.local.set({ enabled: true });
    chrome.scripting.registerContentScripts([
        {
            id: 'paste-script',
            js: ['background/paste.js'],
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
            js: ['background/autocomplete.js'],
            persistAcrossSessions: true,
            matches: ['https://portal.facturaelectronica.sat.gob.mx/*'],
            runAt: 'document_start',
            world: 'MAIN',
            allFrames: true,
        },
        {
            id: 'footer-script',
            js: ['background/footer.js'],
            persistAcrossSessions: true,
            matches: ['https://portal.facturaelectronica.sat.gob.mx/*'],
            runAt: 'document_idle',
            world: 'MAIN',
            allFrames: true,
        },
        {
            id: 'no-frecuent-script',
            js: ['background/no-frecuent.js'],
            persistAcrossSessions: true,
            matches: ['https://portal.facturaelectronica.sat.gob.mx/*'],
            runAt: 'document_idle',
            world: 'MAIN',
            allFrames: true,
        },
    ]);
});

let scripts = null;
// Escuchar mensajes del popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getState') {
        // Leer el estado de storage
        chrome.storage.local.get(['enabled'], result => {
            const isEnabled = result.enabled;
            sendResponse({ enabled: isEnabled });
        });
        // Mantener la conexión abierta para enviar la respuesta de forma asíncrona
        return true;
    } else if (message.action === 'setState' && message.enabled !== undefined) {
        // Almacenar el nuevo estado en storage
        chrome.storage.local.set({ enabled: message.enabled }, () => {
            // Verificar el valor después de establecerlo
            chrome.storage.local.get(['enabled'], result => {
                chrome.scripting.getRegisteredContentScripts(
                    registeredScripts => {
                        scripts = registeredScripts;
                        if (result.enabled) {
                            // Si no está registrado, registrar el script
                            if (!scripts || scripts.length === 0) {
                                chrome.scripting.registerContentScripts([
                                    {
                                        id: 'paste-script',
                                        js: ['background/paste.js'],
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
                                        js: ['background/autocomplete.js'],
                                        persistAcrossSessions: true,
                                        matches: [
                                            'https://portal.facturaelectronica.sat.gob.mx/*',
                                        ],
                                        runAt: 'document_start',
                                        world: 'MAIN',
                                        allFrames: true,
                                    },
                                    {
                                        id: 'footer-script',
                                        js: ['background/footer.js'],
                                        persistAcrossSessions: true,
                                        matches: [
                                            'https://portal.facturaelectronica.sat.gob.mx/*',
                                        ],
                                        runAt: 'document_idle',
                                        world: 'MAIN',
                                        allFrames: true,
                                    },
                                    {
                                        id: 'no-frecuent-script',
                                        js: ['background/no-frecuent.js'],
                                        persistAcrossSessions: true,
                                        matches: [
                                            'https://portal.facturaelectronica.sat.gob.mx/*',
                                        ],
                                        runAt: 'document_idle',
                                        world: 'MAIN',
                                        allFrames: true,
                                    },
                                ]);
                            }
                        } else {
                            // Desregistrar el script
                            chrome.scripting.unregisterContentScripts({
                                ids: [
                                    'paste-script',
                                    'autocomplete-script',
                                    'footer-script',
                                    'no-frecuent',
                                ],
                            });
                        }
                    }
                );
            });
        });
    }
});
