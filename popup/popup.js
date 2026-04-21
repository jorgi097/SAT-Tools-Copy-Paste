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

function reload() {
    location.reload();
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function buildSection(container, sectionData, isCollapsible = false, showTooltips = false) {
    for (const subKey in sectionData) {
        const subData = sectionData[subKey];
        if (typeof subData !== 'object' || subData === null) continue;

        const title = subData.titulo || capitalizeFirstLetter(subKey);
        
        // Extraer los links
        const links = [];
        for (const itemKey in subData) {
            const item = subData[itemKey];
            if (item && item.url && item.nombre) {
                links.push(item);
            }
        }

        // Ordenarlos por su campo order
        links.sort((a, b) => (a.order || 0) - (b.order || 0));

        if (links.length > 0) {
            let wrapper = container;
            let btnContainerWrapper = null;

            if (isCollapsible) {
                wrapper = document.createElement('details');
                const summaryEl = document.createElement('summary');
                summaryEl.className = 'popup-option_title';
                summaryEl.style.cursor = 'pointer';
                summaryEl.style.userSelect = 'none';
                summaryEl.textContent = title;
                wrapper.appendChild(summaryEl);

                btnContainerWrapper = document.createElement('div');
                btnContainerWrapper.className = 'popup-option flex-spacing';
                wrapper.appendChild(btnContainerWrapper);
                container.appendChild(wrapper);
            } else {
                const titleEl = document.createElement('p');
                titleEl.className = 'popup-option_title';
                titleEl.textContent = title;
                container.appendChild(titleEl);

                btnContainerWrapper = document.createElement('div');
                btnContainerWrapper.className = 'popup-option flex-spacing';
                container.appendChild(btnContainerWrapper);
            }
            
            links.forEach(link => {
                const btn = document.createElement('button');
                btn.className = showTooltips ? 'normal-button hint--top hint--rounded hint--info' : 'normal-button';
                if (showTooltips) {
                    btn.setAttribute('aria-label', link.nombre);
                }
                btn.textContent = link.nombre;
                btn.style.flex = "1 1 calc(50% - 10px)";
                btn.style.margin = "2px";
                btn.addEventListener('click', () => {
                    window.open(link.url, '_blank');
                });
                btnContainerWrapper.appendChild(btn);
            });
        }
    }
}

function renderLinks(links) {
    const regimeSelect = document.getElementById('regimeSelect');
    
    const generalSection = document.getElementById('general-section');
    generalSection.innerHTML = '';
    buildSection(generalSection, links.general);

    const certificadosSection = document.getElementById('certificados-section');
    certificadosSection.innerHTML = '';
    buildSection(certificadosSection, links.certificados, true); // Se hace desplegable

    const dynamicSection = document.getElementById('dynamic-section');
    
    function updateDynamicSection() {
        const regime = regimeSelect.value;
        dynamicSection.innerHTML = '';
        buildSection(dynamicSection, links[regime]);
    }

    regimeSelect.addEventListener('change', () => {
        // Guardar la seleccion
        chrome.storage.local.set({ selectedRegime: regimeSelect.value });
        updateDynamicSection();
    });

    // Cargar seleccion guardada
    chrome.storage.local.get(['selectedRegime'], (result) => {
        if (result.selectedRegime) {
            regimeSelect.value = result.selectedRegime;
        }
        updateDynamicSection();
    });
}

fetch(chrome.runtime.getURL('popup/links.json'))
    .then(response => response.json())
    .then(links => {
        renderLinks(links);
    })
    .catch(error => console.error("Error loading links:", error));


    