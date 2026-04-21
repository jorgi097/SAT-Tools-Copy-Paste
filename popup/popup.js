const enabledToggle = document.getElementById('enabledToggle');
let enabledState = null;

// Al abrir el popup, solicitar el estado al service worker
chrome.runtime.sendMessage({ action: 'getState' }, response => {
    if (response && response.enabled !== undefined) {
        updateToggleState(response.enabled);
    }
});

// Función para actualizar la interfaz del toggle
function updateToggleState(enabled) {
    enabledState = enabled;
    enabledToggle.checked = enabled;
    const enabledButton = document.querySelector('.toggle-label');
    if (enabled) {
        enabledButton.textContent = 'Activo';
        enabledButton.classList.remove('disabled');
    }else {
        enabledButton.textContent = 'Inactivo';
        enabledButton.classList.add('disabled');
    }
}

let taxDeclarationPattern = 'https://pstcdypisr\\.clouda\\.sat\\.gob\\.mx/.*/';
let taxDeclarationRegex = new RegExp(taxDeclarationPattern);

// Habilitar y deshabilitar el script principal con el toggle
enabledToggle.addEventListener('change', () => {
    enabledState = enabledToggle.checked;
    updateToggleState(enabledState);

    // Enviar el nuevo estado al service worker para que lo guarde
    chrome.runtime.sendMessage({ action: 'setState', enabled: enabledState });

    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
        // Solo en la página de facturación
        if (
            activeTab.url ===
                'https://portal.facturaelectronica.sat.gob.mx/Factura/GeneraFactura' ||
            taxDeclarationRegex.test(activeTab.url)
        ) {
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                func: reload,
            });
        }
    });
});

// Abrir el portal de facturacion del SAT
document.querySelector('#facturar').addEventListener('click', function () {
    window.open('https://portal.facturaelectronica.sat.gob.mx', '_blank');
});

// Abrir el portal de facturacion del SAT
document.querySelector('#declarar-2').addEventListener('click', () => {
    window.open('https://pstcdypisr.clouda.sat.gob.mx/', '_blank');
});

document.querySelector('#declarar-1').addEventListener('click', () => {
    window.open('https://ptscdecprov.clouda.sat.gob.mx/', '_blank');
});

function reload() {
    location.reload();
}

fetch(chrome.runtime.getURL('popup/links.json'))
    .then(response => response.json())
    .then(links => {
        const obligacionesUrl = links.fisica.obligaciones.url;
        document.getElementById('obligaciones-fisica-btn').addEventListener('click', () => {
            window.open(obligacionesUrl, '_blank');
        });
    });

    