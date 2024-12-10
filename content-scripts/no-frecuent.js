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

const noFrecuentElementIds = {
    rfc: '135textbox59',
    razonSocial: '135textbox60',
    cp: '135textbox61',
    regimenFiscal: '135textboxautocomplete62',
    usoFactura: '135textboxautocomplete72',
};

const moralRegex =
    /^[a-zñ&]{3}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[a-z0-9]{2}[0-9a]$/i;
const fisicaRegex =
    /^[a-zñ&]{4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[a-z0-9]{2}[0-9a]$/i;

const isMoral = rfc => moralRegex.test(rfc);
const isFisica = rfc => fisicaRegex.test(rfc);
const clientQuery = '#\\31 35textboxautocomplete55';
const myRfcQuery = '.detalleUsuario span';

const noFrequentElementQueries = {
    rfc: '#\\31 35textbox59',
    razonSocial: '#\\31 35textbox60',
    cp: '#\\31 35textbox61',
    regimenFiscal: '#\\31 35textboxautocomplete62',
    usoFacturaFisica: '#\\31 35textboxautocomplete72', // 71 NO FRECUENTE: MORAL Y 72 NO FRECUENTE: FISICA
    usoFacturaMoral: '#\\31 35textboxautocomplete71', // 71 NO FRECUENTE: MORAL Y 72 NO FRECUENTE: FISICA
};

class noFrecuentClient {
    constructor(rfc, razonSocial, cp, regimenFiscal, usoFactura) {
        this.rfc = rfc;
        this.razonSocial = razonSocial;
        this.cp = cp;
        this.regimenFiscal = regimenFiscal;
        this.usoFactura = usoFactura;
    }
    rfc;
    razonSocial;
    cp;
    regimenFiscal;
    usoFactura;
}

let currentClient = new noFrecuentClient();

function hasError(element) {
    return element.classList.contains('alert');
}

async function insertSaveButton() {
    const saveButton = document.createElement('button');
    saveButton.innerText = 'Guardar Cliente';
    saveButton.classList.add('saveButton', 'hide');
    saveButton.id = 'saveButton';
    const saveButtonColumn = await getDomElement(
        '#A135row7 > div.panel-body > div:nth-child(6)'
    );
    saveButtonColumn.appendChild(saveButton);
}

function noFrecuentHandler(e) {
    setTimeout(async () => {
        const clientElements = await Promise.all(
            Object.values(noFrequentElementQueries).map(getDomElement)
        );

        const clientValues = clientElements.map(elem => elem.value);

        if (
            clientValues.every(
                val => val !== null && val !== undefined && val !== ''
            ) &&
            clientElements.every(elem => !hasError(elem))
        ) {
            currentClient = new noFrecuentClient(...clientValues);

            const insertedSaveButton = await getDomElement('#saveButton');

            insertedSaveButton.classList.remove('hide');
            insertedSaveButton.addEventListener('click', async e => {
                e.preventDefault();
                const myRfcElement = await getDomElement(myRfcQuery);
                const myRfcText = myRfcElement.textContent;
                const myRfc = myRfcText.match(/^[^\s|]+/)[0];
                chrome.storage.local.get(myRfc, result => {
                    const noFrecuent = result[myRfc] || [];

                    // Buscamos el índice del cliente actual en el array.
                    const index = noFrecuent.findIndex(
                        client => client.rfc === currentClient.rfc
                    );

                    if (index !== -1) {
                        // Si el cliente ya existe, actualizamos su información.
                        noFrecuent[index] = currentClient;
                    } else {
                        // Si no existe, lo añadimos al array.
                        noFrecuent.push(currentClient);
                    }

                    chrome.storage.local.set({ [myRfc]: noFrecuent });
                    insertedSaveButton.classList.add('hide');
                });

                alert('saved');
            });

            let print = Object.values(clientValues).toString();
            console.log(`Completo: ${print}`);
        } else {
            currentClient = new noFrecuentClient();
        }
    }, 1200);
}

async function noFrecuentSave() {
    const client = await getDomElement(clientQuery);
    client.addEventListener('blur', async e => {
        const currentValue = e.target.value;
        const clientVariables = await Promise.all(
            Object.values(noFrequentElementQueries).map(getDomElement)
        );

        if (currentValue === 'Otro') {
            if (document.querySelector('#saveButton') === null)
                insertSaveButton();
            clientVariables.forEach(element => {
                element.addEventListener('blur', noFrecuentHandler);
                element.addEventListener('input', noFrecuentAutocomplete);
            });
        } else if (currentValue !== 'Otro') {
            clientVariables.forEach(element => {
                element.removeEventListener('blur', noFrecuentHandler);
                element.removeEventListener('input', noFrecuentAutocomplete);
            });
        }
    });
}

async function noFrecuentAutocomplete(e) {
    const myRfcElement = await getDomElement(myRfcQuery);
    const myRfcText = myRfcElement.textContent;
    const myRfc = myRfcText.match(/^[^\s|]+/)[0];
    if (e.target.id === noFrecuentElementIds.rfc) {
        const currentValue = e.target.value.toUpperCase();
        chrome.storage.local.get(myRfc, result => {
            const favorites = result[myRfc] || [];
            let filtered = favorites.filter(elem =>
                elem.rfc.startsWith(currentValue)
            );

            filtered.forEach(e => console.log(e));
        });
    }
}

noFrecuentSave();

// chrome.runtime.sendMessage({action : 'getClients'}, (response)=>{
//     console.log(response);
// });
