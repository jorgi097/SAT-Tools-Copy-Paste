let favorites = null; // Aqui se guardaran los datos completos de clientes frecuentes
let clienteFrecuenteElement,
    clientesFrecuentesList,
    clientesFrecuentes,
    razonSocial,
    cp,
    regimenFiscal,
    usoFactura,
    usoFacturaNoFrecuent,
    rfcInput;
let excluirFrecuentes = ['XAXX010101000', 'XEXX010101000', 'Otro']; // Elementos a excluir de clientes frecuentes
let obtenerTimeOut = 2500;
let validationTimeOut = 500;

const obtenerElementosInterval = setInterval(() => {
    clienteFrecuenteElement = document.querySelector(
        '#\\31 35textboxautocomplete55'
    ); // Campo de cliente frecuente
    razonSocial = document.querySelector('#\\31 35textbox60'); // Razon Social Asociada
    cp = document.querySelector('#\\31 35textbox61'); // Codigo Postal Asociado
    regimenFiscal = document.querySelector('#\\31 35textboxautocomplete62'); // Regimen Fiscal Asociado
    usoFactura = document.querySelector('#\\31 35textboxautocomplete72'); // Uso factura Asociado
    usoFacturaNoFrecuent = document.querySelector(
        '#\\31 35textboxautocomplete71'
    ); // Uso factura Asociado No Frecuente
    rfcInput = document.querySelector('#\\31 35textbox59'); // RFC cliente no registrado;

    if (!!clienteFrecuenteElement) {
        clienteFrecuenteElement.dispatchEvent(new Event('focus')); // Esstos eventos hacen que se cargue la lista.
        clienteFrecuenteElement.dispatchEvent(new Event('blur'));
        clientesFrecuentesList = document.querySelector('#ui-id-2'); // Elemento que contiene la lista de clientes frecuentes
    }

    if (!!clientesFrecuentesList) {
        clientesFrecuentes = Array.from(
            clientesFrecuentesList.querySelectorAll('li')
        ).map(frec => frec.textContent);
    }

    if (
        !!clienteFrecuenteElement &&
        !!clientesFrecuentesList &&
        !!clientesFrecuentes &&
        !!razonSocial &&
        !!cp &&
        !!regimenFiscal &&
        !!usoFactura &&
        !!usoFacturaNoFrecuent
    ) {
        console.log('All elements retrieved');
        clearInterval(obtenerElementosInterval);
    }
}, obtenerTimeOut);

function interceptFavorites() {
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (...args) {
        this.addEventListener('load', function () {
            if (this.responseText.includes('Historicos')) {
                let favoritesData = JSON.parse(JSON.parse(this.responseText));
                favorites = favoritesData.Favoritos.Receptores;
            }
        });
        originalSend.apply(this, args);
    };
}

interceptFavorites();

function autocomplete() {
    if (clienteFrecuenteElement) {
        clienteFrecuenteElement.addEventListener('blur', e => {
            let currentValue = e.target.value;

            if (
                currentValue !== '' &&
                !excluirFrecuentes.includes(currentValue) &&
                clientesFrecuentes.includes(currentValue)
            ) {
                const matchedFavorite = favorites.find(
                    favorite => favorite.RFCReceptor === currentValue
                );

                cp.value = matchedFavorite.CodigoPostal;
                cp.dispatchEvent(new Event('blur'));

                // regimenFiscal.value = matchedFavorite.RegimenFiscalDescripcion;
                // regimenFiscal.dispatchEvent(new Event("input"));
                // regimenFiscal.dispatchEvent(new Event("blur"));
            }
        });
        clearInterval(autocompleteInterval);
    }
}

const autocompleteInterval = setInterval(autocomplete, obtenerTimeOut);

// ---------------------------------------------------------------------------------------------
class noFrecuentClient {
    rfc;
    razonSocial;
    cp;
    regimenFiscal;
    usoFactura;
}

const currentClient = new noFrecuentClient();

function noFrecuente(e) {
    let currentInput = e.target;
    console.log(e.target.value);
    switch (currentInput) {
        case rfcInput:
            console.log(`Current: ${currentInput}`);
            currentClient.rfc = currentInput.value;
            break;
        case razonSocial:
            currentClient.razonSocial = currentInput.value;

            break;
        case cp:
            currentClient.cp = currentInput.value;

            break;
        case regimenFiscal:
            currentClient.regimenFiscal = currentInput.value;

            break;
        case usoFacturaNoFrecuent:
            currentClient.usoFactura = currentInput.value;

            break;

        default:
            break;
    }
}

function gh() {
    if (!!clienteFrecuenteElement && !!razonSocial && !!cp && !!regimenFiscal) {
        clienteFrecuenteElement.addEventListener('blur', e => {
            let currentValue = e.target.value;

            if (currentValue !== 'Otro') {
                rfcInput.addEventListener('blur', noFrecuente);
                razonSocial.addEventListener('blur', noFrecuente);
                cp.addEventListener('blur', noFrecuente);
                regimenFiscal.addEventListener('blur', noFrecuente);
                usoFacturaNoFrecuent.addEventListener('blur', noFrecuente);
            }
        });
        clearInterval(ghInterval);
    }
}
const ghInterval = setInterval(gh, 1000);

// ---------------------------------------------------------------------------------------------
function getDomElement(querySelector) {
    return new Promise((resolve, reject) => {
        const chekElementExist = () => {
            const element = document.querySelector(querySelector);
            if (!!element) {
                resolve(element);
            } else {
                setTimeout(chekElementExist, 500);
            }
        };
        chekElementExist();
        // Límite de tiempo
        setTimeout(() => {
            reject(new Error('No se pudieron encontrar los elementos'));
        }, 1000 * 60);
    });
}

const elemto1 = getDomElement("#\\31 35textbox60"); 