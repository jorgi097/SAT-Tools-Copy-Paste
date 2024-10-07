let enabledButton = document.querySelector("#enabledButton");
let enabledState = null;

// Al abrir el popup, solicitar el estado al service worker
chrome.runtime.sendMessage({ action: "getState" }, (response) => {
    console.log(response);
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
}



// Habilitar y deshabilitar el script principal
enabledButton.addEventListener("click", () => {
    // Alternar el estado actual y modificar la interfaz
    console.log("estado antes de click" + enabledState);
    enabledState = !enabledState;
    console.log("estado despues de click" + enabledState);
    updateButtonState(enabledState);

    // Enviar el nuevo estado al service worker para que lo guarde
    chrome.runtime.sendMessage({ action: "setState", enabled: enabledState });
});

// Abrir el portal de facturacion del SAT
document
    .querySelector(".popup-message button")
    .addEventListener("click", function () {
        window.open("https://portal.facturaelectronica.sat.gob.mx", "_blank");
    });

