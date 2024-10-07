// Escuchar mensajes del popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getState") {
        // Leer el estado de storage
        chrome.storage.local.get(["enabled"], (result) => {
            // Si no hay estado almacenado, por defecto estará habilitado
            const isEnabled =
                result.enabled !== undefined ? result.enabled : true;
            sendResponse({ enabled: isEnabled });
        });
        // Mantener la conexión abierta para enviar la respuesta de forma asíncrona
        return true;
    } else if (message.action === "setState" && message.enabled !== undefined) {
        // Almacenar el nuevo estado en storage
        chrome.storage.local.set({ enabled: message.enabled });
    }
});

chrome.storage.local.get(["enabled"], (result) => {
    if (result.enabled) {
        chrome.scripting
            .executeScript({
                target: { tabId: getTabId() },
                files: ["content-script.js"],
                ExecutionWorld: "MAIN",
                
            })
            .then(() => console.log("injected script file"));
    }
});
