const print = (...value) => console.log(...value);

const noFrequentElementQueries = {
    rfc: '#\\31 35textbox59',
    razonSocial: '#\\31 35textbox60',
    cp: '#\\31 35textbox61',
    regimenFiscal: '#\\31 35textboxautocomplete62',
};

const usoFacturaFisicaQuery = '#\\31 35textboxautocomplete72';
const usoFacturaMoralQuery = '#\\31 35textboxautocomplete71';
const myRfcQuery = '.detalleUsuario span';
const clientQuery = '#\\31 35textboxautocomplete55';

const noFrecuentElementIds = {
    rfc: '135textbox59',
    razonSocial: '135textbox60',
    cp: '135textbox61',
    regimenFiscal: '135textboxautocomplete62',
    usoFacturaFisica: '135textboxautocomplete72',
    usoFacturaMoral: '135textboxautocomplete71',
};

//------------------------------------------------------------------------------------------------------------------------

function getDomElement(query) {
    return new Promise((resolve, reject) => {
        const checkElementExist = () => {
            const element = document.querySelector(query);
            if (element) {
                resolve(element);
            } else {
                setTimeout(checkElementExist, 500);
            }
        };
        checkElementExist();

        setTimeout(() => {
            const element = document.querySelector(query);
            if (!element) {
                reject(new Error('No se pudieron encontrar los elementos'));
            }
        }, 1000 * 60);
    });
}

const isMoral = rfc => {
    const moralRegex =
        /^[a-zñ&]{3}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[a-z0-9]{2}[0-9a]$/i;
    return moralRegex.test(rfc);
};

const isFisica = rfc => {
    const fisicaRegex =
        /^[a-zñ&]{4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[a-z0-9]{2}[0-9a]$/i;
    return fisicaRegex.test(rfc);
};

function hasError(element) {
    return element.classList.contains('alert');
}

//------------------------------------------------------------------------------------------------------------------------

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
let lastSavedClient = new noFrecuentClient();

//------------------------------------------------------------------------------------------------------------------------

const insertSaveButton = async () => {
    const saveButton = document.createElement('button');
    saveButton.innerText = 'Guardar Cliente';
    saveButton.classList.add('saveButton', 'hide');
    saveButton.id = 'saveButton';
    const saveButtonColumn = await getDomElement(
        '#A135row7 > div.panel-body > div:nth-child(6)'
    );
    saveButtonColumn.appendChild(saveButton);
};

const saveButtonHandler = async e => {
    // Guarda o Actualiza los datos en el Storage por cada Usuario
    e.preventDefault();
    if (
        Object.values(currentClient).every(
            value => value !== null && value !== undefined && value !== ''
        )
    ) {
        const myRfcElement = await getDomElement(myRfcQuery);
        const myRfcText = myRfcElement.textContent;
        const myRfc = myRfcText.match(/^[^\s|]+/)[0];

        chrome.storage.local.get(myRfc, result => {
            // Valida si existia previamente el cliente
            const noFrecuent = result[myRfc] || [];

            const index = noFrecuent.findIndex(
                client => client.rfc === currentClient.rfc
            );

            if (index !== -1) {
                // Si el cliente ya existe
                noFrecuent[index] = currentClient;
            } else {
                // Si no existe
                noFrecuent.push(currentClient);
            }

            chrome.storage.local.set({ [myRfc]: noFrecuent });

            lastSavedClient = { ...currentClient };
            
            e.target.classList.add('hide');
        });

        alert('Saved');
    }
};

const verifyNoFrecuent = () => {
    // Muestra el boton guardar si los datos estan completos y sin errores
    setTimeout(async () => {
        const rfcInput = await getDomElement(noFrequentElementQueries.rfc);
        const rfcCliente = rfcInput.value;

        let noFrequentElements = { ...noFrequentElementQueries };

        if (!hasError(rfcInput) && rfcCliente.length === 12)
            noFrequentElements.usoFactura = usoFacturaMoralQuery;
        else if (!hasError(rfcInput) && rfcCliente.length === 13)
            noFrequentElements.usoFactura = usoFacturaFisicaQuery;

        const clientElements = await Promise.all(
            Object.values(noFrequentElements).map(getDomElement)
        );

        const clientValues = clientElements.map(elem => elem.value);

        print('verifyNoFrecuent clientElements: ', clientElements);
        print('verifyNoFrecuent clientVAlues: ', clientValues);

        if (
            clientValues.every(
                val => val !== null && val !== undefined && val !== ''
            ) &&
            clientElements.every(elem => !hasError(elem))
        ) {
            currentClient = new noFrecuentClient(...clientValues);

            if (
                Object.keys(currentClient).some(
                    key => currentClient[key] !== lastSavedClient[key]
                )
            ) {
                const insertedSaveButton = await getDomElement('#saveButton');

                insertedSaveButton.classList.remove('hide');
                insertedSaveButton.addEventListener('click', saveButtonHandler);

                let print = Object.values(clientValues).toString();
                console.log(`Completo: ${print}`);
            }
        } else {
            currentClient = new noFrecuentClient();
        }
    }, 1200);
};

const noFrecuentSave = e => {
    setTimeout(async () => {
        // Espera aque se quite la clase 'alert' (Que marca el error)
        const rfcInput = e.target;
        const rfcCliente = e.target.value;

        print(`noFrecuentSave rfcInput: `, rfcInput);
        print(`noFrecuentSave rfcValue: `, rfcCliente);

        let noFrequentElements = { ...noFrequentElementQueries };

        if (!hasError(rfcInput) && rfcCliente.length === 12)
            noFrequentElements.usoFactura = usoFacturaMoralQuery;
        else if (!hasError(rfcInput) && rfcCliente.length === 13)
            noFrequentElements.usoFactura = usoFacturaFisicaQuery;

        const clientElements = await Promise.all(
            Object.values(noFrequentElements).map(getDomElement)
        );

        print(`noFrecuentSave clientElements: `, clientElements);

        // COMO EVITO QUE SE DUPLIQUEN LISTENERS
        clientElements.forEach(elem => {
            elem.addEventListener('blur', verifyNoFrecuent);
            print(`noFrecuentSave Events added`);
        });
    }, 1000);
};

const noFrecuentAutocomplete = async e => {
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

            filtered.forEach(option => {});

            filtered.forEach(e => console.log(e));
        });
    }
};

//------------------------------------------------------------------------------------------------------------------------

const noFrecuentRegisterListener = async () => {
    const client = await getDomElement(clientQuery);

    client.addEventListener('blur', async e => {
        const currentValue = e.target.value;

        const rfcInput = await getDomElement(noFrequentElementQueries.rfc);

        if (currentValue === 'Otro') {
            if (document.querySelector('#saveButton') === null)
                insertSaveButton();
            try {
                rfcInput.addEventListener('blur', noFrecuentSave);
            } catch (error) {
                console.error('Error en listener', error);
            }

            rfcInput.addEventListener('input', noFrecuentAutocomplete);
        } else if (currentValue !== 'Otro') {
            rfcInput.removeEventListener('blur', noFrecuentSave);
            rfcInput.removeEventListener('input', noFrecuentAutocomplete);
            if (!document.querySelector('#saveButton') === null)
                document.querySelector('#saveButton').classList.add('hide');
        }
    });
};

noFrecuentRegisterListener();
