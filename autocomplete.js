let favorites = null; // Aqui se guardaran los datos completos de clientes frecuentes
let clienteFrecuenteElement,
    clientesFrecuentesList,
    clientesFrecuentes,
    razonSocial,
    cp,
    regimenFiscal,
    usoFactura;
let excluirFrecuentes = ["XAXX010101000", "XEXX010101000", "Otro"]; // Elementos a exluir de clientes frecuentes
let obtenerTimeOut = 2500;
let validationTimeOut = 500;

const obtenerElementosInterval = setInterval(() => {
    clienteFrecuenteElement = document.querySelector(
        "#\\31 35textboxautocomplete55"
    ); // Campo de cliente frecuente
    razonSocial = document.querySelector("#\\31 35textbox60"); // Razon Social Asociada
    cp = document.querySelector("#\\31 35textbox61"); // Codigo Postal Asociado
    regimenFiscal = document.querySelector("#\\31 35textboxautocomplete62"); // Regimen Fiscal Asociado
    usoFactura = document.querySelector("#\\31 35textboxautocomplete72"); // Uso factura Asociado

    if (!!clienteFrecuenteElement) {
        clienteFrecuenteElement.dispatchEvent(new Event("focus"));
        clienteFrecuenteElement.dispatchEvent(new Event("blur"));
        clientesFrecuentesList = document.querySelector("#ui-id-2"); // Elemento que contiene la lista de clientes frecuentes
    }

    if (!!clientesFrecuentesList) {
        clientesFrecuentes = Array.from(
            clientesFrecuentesList.querySelectorAll("li")
        ).map((frec) => frec.textContent);
    }


    if (
        !!clienteFrecuenteElement &&
        !!clientesFrecuentesList &&
        !!clientesFrecuentes &&
        !!razonSocial &&
        !!cp &&
        !!regimenFiscal &&
        !!usoFactura
    ) {
        clearInterval(obtenerElementosInterval);
    }
}, obtenerTimeOut);

//----------------------MAIN FUNCTIONALITY-----------------------------------------

function interceptFavorites() {
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (...args) {
        this.addEventListener("load", function () {
            if (this.responseText.includes("Historicos")) {
                let favoritesData = JSON.parse(JSON.parse(this.responseText));
                favorites = favoritesData.Favoritos.Receptores;
            }
        });
        originalSend.apply(this, args);
    };
}

interceptFavorites();

//--------------------------------------------------------------------------------

function autocomplete() {
    if (clienteFrecuenteElement) {
        clienteFrecuenteElement.addEventListener("blur", (e) => {
            let currentValue = e.target.value;

            if (
                currentValue !== "" &&
                !excluirFrecuentes.includes(currentValue) &&
                clientesFrecuentes.includes(currentValue)
            ) {
                const matchedFavorite = favorites.find(
                    (favorite) => favorite.RFCReceptor === currentValue
                );

                cp.value = matchedFavorite.CodigoPostal;
                cp.dispatchEvent(new Event("blur"));

                // regimenFiscal.value = matchedFavorite.RegimenFiscalDescripcion;
                // regimenFiscal.dispatchEvent(new Event("input"));
                // regimenFiscal.dispatchEvent(new Event("blur"));
            }
        });
        clearInterval(autocompleteInterval);
    }
}

const autocompleteInterval = setInterval(autocomplete, obtenerTimeOut);

