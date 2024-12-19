const scripts = [
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
        matches: ['https://portal.facturaelectronica.sat.gob.mx/Factura/GeneraFactura'],
        runAt: 'document_start',
        world: 'MAIN',
        allFrames: true,
    },
    {
        id: 'no-frecuent-script',
        js: ['content-scripts/no-frecuent.js'],
        persistAcrossSessions: true,
        matches: ['https://portal.facturaelectronica.sat.gob.mx/Factura/GeneraFactura'],
        runAt: 'document_idle',
        world: 'ISOLATED',
        allFrames: true,
    },
    {
        id: 'footer-script',
        js: ['content-scripts/footer.js'],
        persistAcrossSessions: true,
        matches: ['https://portal.facturaelectronica.sat.gob.mx/Factura/GeneraFactura'],
        runAt: 'document_idle',
        world: 'ISOLATED',
        allFrames: true,
    },
    {
        id: 'constancia-script',
        js: ['content-scripts/constancia.js'],
        persistAcrossSessions: true,
        matches: ['https://wwwmat.sat.gob.mx/operacion/53027/genera-tu-constancia-de-situacion-fiscal.'],
        runAt: 'document_idle',
        world: 'ISOLATED',
        allFrames: true,
    },
    // {
    //     id: 'testing-script',
    //     js: ['content-scripts/testing.js'],
    //     persistAcrossSessions: true,
    //     matches: ['https://portal.facturaelectronica.sat.gob.mx/*'],
    //     runAt: 'document_idle',
    //     world: 'ISOLATED',
    //     allFrames: true,
    // },
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
                        if (result.enabled) {
                            // Si no está registrado, registrar el script
                            if (
                                !registeredScripts ||
                                registeredScripts.length === 0
                            ) {
                                chrome.scripting.registerContentScripts(
                                    scripts
                                );
                            }
                        } else {
                            // Desregistrar el script
                            const unregisterScripts = {ids: scripts.map(({ id }) => id)}

                            chrome.scripting.unregisterContentScripts(unregisterScripts);
                        }
                    }
                );
            });
        });
    }
});

// Escuchar mensajes de content-scripts
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === 'getClients') {
//         chrome.storage.local.get('noFrecuent', items => {
//             if (chrome.runtime.lastError) {
//                 console.error(chrome.runtime.lastError);
//                 return;
//             }
//             sendResponse(items);
//         });
//     }
//     return true;
// });
