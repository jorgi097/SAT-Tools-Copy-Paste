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

const clientQuery = '#\\31 35textboxautocomplete55';

const noFrequentElementQueries = {
    rfc: '#\\31 35textbox59',
    razonSocial: '#\\31 35textbox60',
    cp: '#\\31 35textbox61',
    regimenFiscal: '#\\31 35textboxautocomplete62',
    usoFactura: '#\\31 35textboxautocomplete72',
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
    saveButton.style =
        'margin-top : 28px; height : 30px; border:0.8px solid rgb(204, 204, 204); width: 200px; border-radius: 4px; background-color: rgb(245, 245, 245);';
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
            insertSaveButton();
            const insertedSaveButton = await getDomElement('#saveButton');
            insertedSaveButton.addEventListener('click', e => {
                e.preventDefault();
                chrome.storage.local.get('noFrecuent', result => {
                    const noFrecuent = result.noFrecuent || [];

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
                    chrome.storage.local.set({ noFrecuent });
                });
                console.log('saved');
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
            clientVariables.forEach(element => {
                element.addEventListener('blur', noFrecuentHandler);
            });
        } else if (currentValue !== 'Otro') {
            clientVariables.forEach(element => {
                element.removeEventListener('blur', noFrecuentHandler);
            });
        }
    });
}

noFrecuentSave();


chrome.runtime.sendMessage({action : 'getClients'}, (response)=>{
    console.log(response);
});

