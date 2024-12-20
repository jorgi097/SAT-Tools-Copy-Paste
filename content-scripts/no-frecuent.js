const noFrequentElementsQueries = {
    rfc: '#\\31 35textbox59',
    razonSocial: '#\\31 35textbox60',
    cp: '#\\31 35textbox61',
    regimenFiscal: '#\\31 35textboxautocomplete62',
    usoFacturaFisica: '#\\31 35textboxautocomplete72',
    usoFacturaMoral: '#\\31 35textboxautocomplete71',
    noFrecuentClient: '#\\31 35textboxautocomplete55',
    myRfc: '.detalleUsuario span',
};

const validUsoFactura = [
    'Nómina',
    'Pagos',
    'Honorarios médicos, dentales y gastos hospitalarios.',
    'Gastos médicos por incapacidad o discapacidad.',
    'Gastos funerales.',
    'Donativos.',
    'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación).',
    'Aportaciones voluntarias al SAR.',
    'Primas por seguros de gastos médicos.',
    'Gastos de transportación escolar obligatoria.',
    'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones.',
    'Pagos por servicios educativos (colegiaturas).',
    'Adquisición de mercancías.',
    'Devoluciones, descuentos o bonificaciones.',
    'Gastos en general.',
    'Construcciones.',
    'Mobiliario y equipo de oficina por inversiones.',
    'Equipo de transporte.',
    'Equipo de computo y accesorios.',
    'Dados, troqueles, moldes, matrices y herramental.',
    'Comunicaciones telefónicas.',
    'Comunicaciones satelitales.',
    'Otra maquinaria y equipo.',
    'Sin efectos fiscales.  ',
];

const noFrequentElements = {};
let filteredClients = [];
let myRfc;

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

//-----------------------------------------------UTILS--------------------------------------------------------------------

const hasError = element => element.classList.contains('alert');
const isEmpty = array => array.length === 0;
const print = (...value) => console.log(...value);

const isDifferent = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    // Si tienen diferente cantidad de claves, hay una diferencia
    if (keys1.length !== keys2.length) {
        return true;
    }

    // Comparar los valores de cada clave
    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return true; // Retorna true al encontrar la primera diferencia
        }
    }

    return false; // Retorna false si no hay diferencias
};

const insertSaveButton = () => {
    if (!document.querySelector('#saveButton')) {
        const saveButton = document.createElement('button');
        saveButton.innerText = 'Guardar Cliente';
        saveButton.classList.add('saveButton', 'hide');
        saveButton.id = 'saveButton';
        try {
            const saveButtonColumn = document.querySelector(
                '#A135row7 > div.panel-body > div:nth-child(6)'
            );
            saveButtonColumn.appendChild(saveButton);
        } catch (error) {}
    }
};

const insertList = () => {
    const rfcInput = noFrequentElements.rfc;
    if (!document.querySelector('#rfcList')) {
        const rfcList = document.createElement('div');
        rfcList.id = 'rfcList';
        rfcList.classList.add('rfcListContainer');

        const optionsSizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const computedWidth = window.getComputedStyle(
                    entry.target
                ).width;
                rfcList.style.width = computedWidth;
            }
        });
        optionsSizeObserver.observe(rfcInput);

        rfcInput.insertAdjacentElement('afterend', rfcList);

        rfcList.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            const rfcInput = noFrequentElements.rfc;
            rfcInput.style.marginBottom = '5px';
            rfcList.classList.add('hide');
            if (e.target.classList.contains('opcionRfc')) {
                handleSelectClient(e);
            }
        });

        rfcList.classList.add('hide');
    }
};

//-----------------------------------------------SAVE---------------------------------------------------------------------

const saveButtonHandler = e => {
    // Guarda o Actualiza los datos en el Storage por cada Usuario
    e.preventDefault();

    if (
        Object.values(currentClient).every(
            value => value !== null && value !== undefined && value !== ''
        )
    ) {
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

            e.target.classList.add('hide');
        });

        alert('Saved');
    }
};

const handleVerifyNoFrecuent = () => {
    print('ENTERED handleVerifyNoFrecuent');

    // Muestra el boton guardar si los datos estan completos y sin errores
    setTimeout(() => {
        const rfcInput = noFrequentElements.rfc;
        const rfcCliente = rfcInput.value;
        const insertedSaveButton = document.querySelector('#saveButton');

        if (
            (rfcCliente.length === 12 || rfcCliente.length === 13) &&
            !hasError(rfcInput)
        ) {
            const clientElements = {
                rfc: noFrequentElements.rfc,
                razonSocial: noFrequentElements.razonSocial,
                cp: noFrequentElements.cp,
                regimenFiscal: noFrequentElements.regimenFiscal,
            };

            clientElements.usoFactura =
                rfcCliente.length === 12
                    ? noFrequentElements.usoFacturaMoral
                    : noFrequentElements.usoFacturaFisica;

            const clientValues = Object.values(clientElements).map(
                elem => elem.value
            );

            if (
                clientValues.every(
                    val => val !== null && val !== undefined && val !== ''
                ) &&
                Object.values(clientElements).every(elem => !hasError(elem))
            ) {
                currentClient = new noFrecuentClient(...clientValues);

                chrome.storage.local.get(myRfc, result => {
                    // Valida si existia previamente el cliente
                    const noFrecuent = result[myRfc] || [];

                    const clientIndex = noFrecuent.findIndex(
                        client => client.rfc === currentClient.rfc
                    );

                    if (clientIndex !== -1) {
                        if (
                            isDifferent(currentClient, noFrecuent[clientIndex])
                        ) {
                            insertedSaveButton.classList.remove('hide');

                            insertedSaveButton.removeEventListener(
                                'click',
                                saveButtonHandler
                            );
                            insertedSaveButton.addEventListener(
                                'click',
                                saveButtonHandler
                            );

                        }
                    } else {
                        const insertedSaveButton =
                            document.querySelector('#saveButton');

                        insertedSaveButton.classList.remove('hide');

                        insertedSaveButton.removeEventListener(
                            'click',
                            saveButtonHandler
                        );
                        insertedSaveButton.addEventListener(
                            'click',
                            saveButtonHandler
                        );
                    }
                });
            } else {
                currentClient = new noFrecuentClient();
                insertedSaveButton.classList.add('hide');
            }
        }
    }, 1200);
};

const noFrecuentSave = e => {
    print('ENTERED noFrecuentSave');

    setTimeout(() => {
        // Espera aque se quite la clase 'alert' (Que marca el error)
        const rfcInput = e.target;
        const rfcCliente = e.target.value;

        if (
            (rfcCliente.length === 12 || rfcCliente.length === 13) &&
            !hasError(rfcInput)
        ) {
            const clientElements = {
                rfc: noFrequentElements.rfc,
                razonSocial: noFrequentElements.razonSocial,
                cp: noFrequentElements.cp,
                regimenFiscal: noFrequentElements.regimenFiscal,
            };

            clientElements.usoFactura =
                rfcCliente.length === 12
                    ? noFrequentElements.usoFacturaMoral
                    : noFrequentElements.usoFacturaFisica;

            Object.values(clientElements).forEach(elem => {
                elem.removeEventListener('blur', handleVerifyNoFrecuent);
                elem.addEventListener('blur', handleVerifyNoFrecuent);
            });
        }
    }, 1000);
};

//-------------------------------------------AUTOCOMPLETE-----------------------------------------------------------------

const handleSelectClient = e => {
    const currentSelectedClient = e.target.textContent;
    print('ENTERED handleSelectClient');

    const inputRfc = noFrequentElements.rfc;
    const inputRazonSocial = noFrequentElements.razonSocial;
    const inputCp = noFrequentElements.cp;
    const inputRegimen = noFrequentElements.regimenFiscal;
    const rfcList = document.querySelector('#rfcList');

    const selectedClient = filteredClients.find(
        elem => elem.rfc === currentSelectedClient
    );

    if (selectedClient) {
        inputRfc.value = selectedClient.rfc;
        inputRfc.dispatchEvent(new Event('input'));
        inputRfc.dispatchEvent(new Event('blur'));

        inputRazonSocial.value = selectedClient.razonSocial;
        inputRazonSocial.dispatchEvent(new Event('input'));
        inputRazonSocial.dispatchEvent(new Event('blur'));

        inputCp.value = selectedClient.cp;
        inputCp.dispatchEvent(new Event('input'));
        inputCp.dispatchEvent(new Event('blur'));

        inputRegimen.value = selectedClient.regimenFiscal;
        inputRegimen.dispatchEvent(new Event('focus'));
        setTimeout(() => {
            let regimenOption = document.querySelector('#ui-id-3 > li');
            if (regimenOption) {
                regimenOption.dispatchEvent(
                    new Event('click', { bubbles: true })
                );
                inputRegimen.dispatchEvent(new Event('blur'));
            }
        }, 1000);

        const inputUsoFactura =
            inputRfc.value.length === 12
                ? noFrequentElements.usoFacturaMoral
                : noFrequentElements.usoFacturaFisica;

        inputUsoFactura.value = selectedClient.usoFactura;
        inputUsoFactura.dispatchEvent(new Event('focus'));

        setTimeout(() => {
            const useOption =
                inputRfc.value.length === 12
                    ? document.querySelector('#ui-id-5 > li')
                    : document.querySelector('#ui-id-6 > li');

            if (useOption) {
                useOption.dispatchEvent(new Event('click', { bubbles: true }));
                inputUsoFactura.dispatchEvent(new Event('blur'));
            }
        }, 1000);
        setTimeout(() => {
            rfcList.classList.add('hide');
        }, 1000);
    } else {
        console.error('No client found for RFC:', currentSelectedClient);
    }
};

const noFrecuentAutocomplete = e => {
    const currentValue = e.target.value.toUpperCase();
    print('ENTERED noFrecuentAutocomplete');

    chrome.storage.local.get(myRfc, result => {
        const savedData = result[myRfc] || [];

        if (!isEmpty(savedData)) {
            const rfcList = document.querySelector('#rfcList');

            rfcList.innerHTML = '';

            let filtered = savedData.filter(
                elem => currentValue !== '' && elem.rfc.startsWith(currentValue)
            );

            if (isEmpty(filtered)) rfcList.classList.add('hide');

            if (!isEmpty(filtered)) {
                filteredClients = [...filtered]; //

                rfcList.classList.remove('hide');

                filtered.forEach(client => {
                    const option = document.createElement('div');
                    option.classList.add('opcionRfc');
                    option.textContent = client.rfc;
                    rfcList.appendChild(option);
                });
            }
        }
    });
};

//-----------------------------------------------MAIN---------------------------------------------------------------------

const registerClientListener = () => {
    const client = noFrequentElements.noFrecuentClient;

    client.addEventListener('blur', e => {
        const currentValue = e.target.value;
        const rfcInput = noFrequentElements.rfc;

        if (currentValue === 'Otro') {
            insertSaveButton();
            insertList();

            rfcInput.removeEventListener('blur', noFrecuentSave);
            rfcInput.addEventListener('blur', noFrecuentSave);
            rfcInput.removeEventListener('input', noFrecuentAutocomplete);
            rfcInput.addEventListener('input', noFrecuentAutocomplete);
            rfcInput.addEventListener('focus', e => {
                if (e.target.value !== '') e.target.style.marginBottom = '0';
            });
            rfcInput.addEventListener('blur', e => {
                if (e.target.value === '') e.target.style.marginBottom = '5px';
            });
        } else {
            rfcInput.removeEventListener('blur', noFrecuentSave);
            rfcInput.removeEventListener('input', noFrecuentAutocomplete);
            if (document.querySelector('#saveButton') !== null)
                document.querySelector('#saveButton').classList.add('hide');
        }
    });
};

// Execute the script only when all elements are loaded
const checkElementExists = setInterval(() => {
    Object.entries(noFrequentElementsQueries).forEach(([key, query]) => {
        if (!noFrequentElements[key]) {
            try {
                noFrequentElements[key] = document.querySelector(query);
            } catch (error) {}
        }
    });

    const allElementsLoaded = Object.keys(noFrequentElementsQueries).every(
        (_, index) => {
            const key = Object.keys(noFrequentElementsQueries)[index];
            return (
                noFrequentElements[key] !== null &&
                noFrequentElements[key] !== undefined
            );
        }
    );

    if (allElementsLoaded) {
        clearInterval(checkElementExists);
        const myRfcText = noFrequentElements.myRfc.textContent;
        myRfc = myRfcText.match(/^[^\s|]+/)[0];
        registerClientListener();
    }
}, 3000);
