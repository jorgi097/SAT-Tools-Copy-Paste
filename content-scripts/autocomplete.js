const frequentElementQueries = {
    client: '#\\31 35textboxautocomplete55',
    razonSocial: '#\\31 35textbox60',
    cp: '#\\31 35textbox61',
    regimenFiscal: '#\\31 35textboxautocomplete62',
};

const frequentElements = {};

const favorites = []; // Aqui se guardaran los datos completos de clientes frecuentes

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

function frequentAutocomplete() {
    const client = frequentElements.client;
    client.addEventListener('blur', e => {
        const currentValue = e.target.value;
        const cp = frequentElements.cp;
        const regimenFiscal = frequentElements.regimenFiscal;
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
                    
                    regimenFiscal.value = cleanRegimen;
                    regimenFiscal.dispatchEvent(new Event('focus'));
                    setTimeout(() => {
                        document
                            .querySelector('#ui-id-3 > li')
                            .dispatchEvent(
                                new Event('click', { bubbles: true })
                            );
                    }, 1000);
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

// Execute the script only when all elements are loaded
const checkElementExists = setInterval(() => {
    Object.entries(frequentElementQueries).forEach(([key, query]) => {
        if (!frequentElements[key]) {
            try {
                frequentElements[key] = document.querySelector(query);
            } catch (error) {}
        }
    });

    const allElementsLoaded = Object.keys(frequentElementQueries).every(
        (_, index) => {
            const key = Object.keys(frequentElementQueries)[index];
            return (
                frequentElements[key] !== null &&
                frequentElements[key] !== undefined
            );
        }
    );

    if (allElementsLoaded) {
        clearInterval(checkElementExists);
        frequentAutocomplete();
    }
}, 3000);
