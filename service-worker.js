chrome.runtime.onInstalled.addListener((details) => {
    chrome.storage.local.set({ enabled: true });
    chrome.scripting.registerContentScripts([
        {
            id: "paste-script",
            js: ["content-script.js"],
            persistAcrossSessions: true,
            matches: [
                "https://portal.facturaelectronica.sat.gob.mx/*",
                "https://pstcdypisr.clouda.sat.gob.mx/*"
            ],
            runAt: "document_idle",
            world: "MAIN",
            allFrames: true,
        },
    ]);
    console.log("Script registrado al inicio de instalacion");
});

let scripts = null;
// Escuchar mensajes del popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getState") {
        // Leer el estado de storage
        chrome.storage.local.get(["enabled"], (result) => {
            // Si no hay estado almacenado, por defecto estará habilitado
            const isEnabled = result.enabled;
            sendResponse({ enabled: isEnabled });
        });
        // Mantener la conexión abierta para enviar la respuesta de forma asíncrona
        return true;
    } else if (message.action === "setState" && message.enabled !== undefined) {
        // Almacenar el nuevo estado en storage
        chrome.storage.local.set({ enabled: message.enabled }, () => {
            // Verificar el valor después de establecerlo
            chrome.storage.local.get(["enabled"], (result) => {
                // Obtener los scripts registrados de forma asíncrona
                chrome.scripting.getRegisteredContentScripts(
                    (registeredScripts) => {
                        scripts = registeredScripts;

                        console.log("scripts registrados");
                        console.log(scripts);

                        if (result.enabled) {
                            // Si no está registrado, registrar el script
                            if (!scripts || scripts.length === 0) {
                                chrome.scripting.registerContentScripts([
                                    {
                                        id: "paste-script",
                                        js: ["content-script.js"],
                                        persistAcrossSessions: true,
                                        matches: [
                                            "https://portal.facturaelectronica.sat.gob.mx/*",
                                            "https://pstcdypisr.clouda.sat.gob.mx/*"
                                        ],
                                        runAt: "document_idle",
                                        world: "MAIN",
                                        allFrames: true,
                                    },
                                ]);
                                console.log("Registered");
                            }
                        } else {
                            // Desregistrar el script
                            chrome.scripting.unregisterContentScripts({
                                ids: ["paste-script"],
                            });
                            console.log("Unregistered");
                        }
                    }
                );
            });
        });
    }
});
