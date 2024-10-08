let enabledButton = document.querySelector("#enabledButton");
let enabledState = null;

// Al abrir el popup, solicitar el estado al service worker
chrome.runtime.sendMessage({ action: "getState" }, (response) => {
    if (response && response.enabled !== undefined) {
        updateButtonState(response.enabled);
    }
});

// Función para actualizar la interfaz
function updateButtonState(enabled) {
    enabledState = enabled;
    enabledButton.innerHTML = enabled ? "Habilitado" : "Deshabilitado";
    enabledButton.classList.add(enabled ? "enabledButton" : "disabledButton");
    enabledButton.classList.remove(
        enabled ? "disabledButton" : "enabledButton"
    );
    enabledButton.setAttribute(
        "aria-label",
        enabled ? "Selecciona para desactiivar" : "Selecciona para activar"
    );
}

// Habilitar y deshabilitar el script principal
enabledButton.addEventListener("click", () => {
    // Alternar el estado actual y modificar la interfaz
    enabledState = !enabledState;
    updateButtonState(enabledState);

    // Enviar el nuevo estado al service worker para que lo guarde
    chrome.runtime.sendMessage({ action: "setState", enabled: enabledState });
    // Obtén la pestaña activa primero
    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
        // Ejecuta el script en la pestaña activa
        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: reload,
        });
    });
});

// Abrir el portal de facturacion del SAT
document
    .querySelector(".popup-message-link")
    .addEventListener("click", function () {
        window.open("https://portal.facturaelectronica.sat.gob.mx", "_blank");
    });

function reload() {
    location.reload();
}
