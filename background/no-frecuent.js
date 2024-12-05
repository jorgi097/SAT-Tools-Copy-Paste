const noFrecuentIds = {
    rfc: '135textbox59',
    razonSocial: '135textbox60',
    cp: '135textbox61',
    regimenFiscal: '135textboxautocomplete62',
    usoFactura: '135textboxautocomplete72',
};

const noFrequentElementQueries = {
    rfcNoFrecuentQuery: '#\\31 35textbox59',
    razonSocialQuery: '#\\31 35textbox60',
    cpQuery: '#\\31 35textbox61',
    regimenFiscalQuery: '#\\31 35textboxautocomplete62',
    usoFacturaNoFrecuentQuery: '#\\31 35textboxautocomplete72',
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

function noFrecuentHandler(e) {
    async function saveValues() {
        const clientElements = await Promise.all(
            Object.values(noFrequentElementQueries).map(getDomElement)
        );

        const clientValues = clientElements.map(elem => elem.value);
        return [clientElements, clientValues];
    }

    setTimeout(async () => {
        const [clientElements, clientValues] = await saveValues();

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
                // e.stopImmediatePropagation();
                console.log('saved');
            });

            let print = Object.values(clientValues).toString();
            console.log(`Completo: ${print}`);
        } else {
            currentClient = new noFrecuentClient();
        }
    }, 1200);
}

async function noFrecuentAutocomplete() {
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

noFrecuentAutocomplete();

async function insertSaveButton() {
    const saveButton = document.createElement('button');
    saveButton.innerText = 'Guardar Contacto';
    saveButton.style =
        'margin-top : 28px; height : 30px; border:0.8px solid rgb(204, 204, 204); width: 200px; border-radius: 4px; background-color: rgb(245, 245, 245);';
    saveButton.id = 'saveButton';
    const saveButtonColumn = await getDomElement(
        '#A135row7 > div.panel-body > div:nth-child(6)'
    );
    saveButtonColumn.appendChild(saveButton);
}
