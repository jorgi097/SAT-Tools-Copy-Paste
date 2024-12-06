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

        setTimeout(() => {
            reject(new Error('No se pudieron encontrar los elementos'));
        }, 1000 * 60);
    });
}

const favorites = []; // Aqui se guardaran los datos completos de clientes frecuentes

const clientQuery = '#\\31 35textboxautocomplete55';

const frequentElementQueries = {
    razonSocial: '#\\31 35textbox60',
    cp: '#\\31 35textbox61',
    regimenFiscal: '#\\31 35textboxautocomplete62',
    usoFactura: '#\\31 35textboxautocomplete71',
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

        if (currentValue !== '' && !excluirClient.includes(currentValue)) {
            const matchedFavorite = favorites.find(
                favorite => favorite.RFCReceptor === currentValue
            );

            cp.value = matchedFavorite.CodigoPostal;
            cp.dispatchEvent(new Event('blur'));

            // regimenFiscal.value = matchedFavorite.regimenFiscalDescripcion;
            // regimenFiscal.dispatchEvent(new Event("blur"));
        } else {
            cp.value = '';
            cp.dispatchEvent(new Event('blur'));
        }
    });
}

frequentAutocomplete();
