function getDomElement(querySelector) {
    return new Promise((resolve, reject) => {
        const checkElementExist = () => {
            const element = document.querySelector(querySelector);
            if (element) {
                resolve(element);
            } else {
                setTimeout(checkElementExist, 500);
            }
        };
        checkElementExist();

        setTimeout(() => {
            const element = document.querySelector(querySelector);
            if (!element) {
                reject(new Error('No se pudieron encontrar los elementos'));
            }
        }, 1000 * 60);
    });
}

const favorites = []; // Aqui se guardaran los datos completos de clientes frecuentes

const clientQuery = '#\\31 35textboxautocomplete55';

const frequentElementQueries = {
    razonSocial: '#\\31 35textbox60',
    cp: '#\\31 35textbox61',
    regimenFiscal: '#\\31 35textboxautocomplete62',
    usoFactura: '#\\31 35textboxautocomplete66', //VACIA O FRECUENTE: MORAL O FISICA
};

const excluirClient = ['XAXX010101000', 'XEXX010101000', 'Otro']; // Elementos a excluir de clientes frecuentes

//-----------------------------------------------------------------------------------------------------------------------

function interceptFavorites() {
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (...args) {
        this.addEventListener('load', function () {
            if (this.responseText.includes('Historicos')) {
                const favoritesData = JSON.parse(JSON.parse(this.responseText));
                favorites.push(...favoritesData.Favoritos.Receptores);
            }
        });
        originalSend.apply(this, args);
    };
}

interceptFavorites();

//-----------------------------------------------------------------------------------------------------------------------

async function frequentAutocomplete() {
    const client = await getDomElement(clientQuery);
    client.addEventListener('blur', async e => {
        const currentValue = e.target.value;
        const cp = await getDomElement(frequentElementQueries.cp);
        const regimenFiscal = await getDomElement(
            frequentElementQueries.regimenFiscal
        );

        if (currentValue !== '' && !excluirClient.includes(currentValue)) {
            const matchedFavorite = favorites.find(
                favorite => favorite.RFCReceptor === currentValue
            );

            if (matchedFavorite !== undefined) {
                console.log(matchedFavorite);
                cp.value = matchedFavorite.CodigoPostal;
                cp.dispatchEvent(new Event('blur'));

                setTimeout(() => {
                    let cleanWord = /[^-0-9]+$/;
                    let cleanRegimen =
                        matchedFavorite.RegimenFiscalDescripcion.match(
                            cleanWord
                        )[0].trim();

                    // Encuentra el modelo de Knockout asociado al elemento
                    let knockoutModel = ko.dataFor(regimenFiscal);

                    // Si hay un modelo, actualiza la propiedad vinculada
                    if (knockoutModel && knockoutModel.E1350003PFAC103) {
                        knockoutModel.E1350003PFAC103(cleanRegimen); // Actualiza el observable de Knockout
                        regimenFiscal.dispatchEvent(new Event('input'));
                        regimenFiscal.dispatchEvent(new Event('change'));
                        regimenFiscal.dispatchEvent(new Event('blur'));
                    }
                }, 1000);
            }
        } else {
            cp.value = '';
            cp.dispatchEvent(new Event('blur'));
            regimenFiscal.value = '';
            regimenFiscal.dispatchEvent(new Event('blur'));
        }
    });
}

frequentAutocomplete();
