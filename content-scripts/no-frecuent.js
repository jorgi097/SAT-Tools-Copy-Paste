const print = (...value) => console.log(...value);

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

const noFrequentElementsIds = {
    rfc: '135textbox59',
    razonSocial: '135textbox60',
    cp: '135textbox61',
    regimenFiscal: '135textboxautocomplete62',
    usoFacturaFisica: '135textboxautocomplete72',
    usoFacturaMoral: '135textboxautocomplete71',
};

const noFrequentElements = {};

const checkElementExists = setInterval(() => {
    Object.values(noFrequentElementsQueries).forEach((query, index) => {
        try {
            [
                noFrequentElements[
                    Object.keys(noFrequentElementsQueries)[index]
                ],
            ] = document.querySelector(query);
            
        } catch (error) {}
        console.log('keys al momento: ',Object.keys(noFrequentElements));
        if (
            Object.values(noFrequentElements).every(
                elem => elem !== null && elem !== undefined
            )
        ) {
           
            // clearInterval(checkElementExists);
        }
    });
}, 2000);

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

function hasError(element) {
    return element.classList.contains('alert');
}

function isEmpty(array) {
    return array.length === 0;
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

        if (
            clientValues.every(
                val => val !== null && val !== undefined && val !== ''
            ) &&
            clientElements.every(elem => !hasError(elem))
        ) {
            currentClient = new noFrecuentClient(...clientValues);

            if (
                Object.keys(currentClient).some(
                    key => currentClient[key] !== lastSavedClient[key] //VERIFICAR DESDE LOCALSTORAGE SI ES IGUAL A UNO QUE YA EXISTE
                )
            ) {
                const insertedSaveButton = await getDomElement('#saveButton');

                insertedSaveButton.classList.remove('hide');
                insertedSaveButton.addEventListener('click', saveButtonHandler);

                let printing = Object.values(clientValues).toString();
                print(`Completo: ${printing}`);
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

        let noFrequentElements = { ...noFrequentElementQueries };

        if (!hasError(rfcInput) && rfcCliente.length === 12)
            noFrequentElements.usoFactura = usoFacturaMoralQuery;
        else if (!hasError(rfcInput) && rfcCliente.length === 13)
            noFrequentElements.usoFactura = usoFacturaFisicaQuery;

        const clientElements = await Promise.all(
            Object.values(noFrequentElements).map(getDomElement)
        );

        // COMO EVITO QUE SE DUPLIQUEN LISTENERS
        clientElements.forEach(elem => {
            elem.addEventListener('blur', verifyNoFrecuent);
        });
    }, 1000);
};

const noFrecuentAutocomplete = async e => {
    const myRfcElement = await getDomElement(myRfcQuery);
    const myRfcText = myRfcElement.textContent;
    const myRfc = myRfcText.match(/^[^\s|]+/)[0];

    const currentValue = e.target.value.toUpperCase();

    chrome.storage.local.get(myRfc, result => {
        const favorites = result[myRfc] || [];
        if (!isEmpty(favorites)) {
            let filtered = favorites.filter(
                elem => currentValue !== '' && elem.rfc.startsWith(currentValue)
            );

            const rfcList = document.querySelector('#rfcList');
            rfcList.innerHTML = '';
            if (filtered.length <= 0) rfcList.classList.add('hide');

            const inputRfc = document.querySelector(
                noFrequentElementQueries.rfc
            );
            const inputCp = document.querySelector(noFrequentElementQueries.cp);
            const inputRazonSocial = document.querySelector(
                noFrequentElementQueries.razonSocial
            );
            const inputRegimen = document.querySelector(
                noFrequentElementQueries.regimenFiscal
            );

            if (filtered.length > 0) {
                rfcList.classList.remove('hide');
                filtered.forEach(client => {
                    const option = document.createElement('div');
                    option.classList.add('opcionRfc');
                    option.textContent = client.rfc;

                    // Debugging: Log when creating option
                    console.log('Creating option for:', client.rfc);

                    rfcList.appendChild(option);

                    // Use event delegation or ensure clean event binding
                    option.addEventListener('click', function (clickEvent) {
                        // Prevent any default behavior
                        clickEvent.preventDefault();
                        clickEvent.stopPropagation();

                        // Debugging: Log when clicking
                        console.log('Clicked option:', this.textContent);

                        const selected = this.textContent;
                        print(selected);
                        const selectedClient = filtered.find(
                            elem => elem.rfc === selected
                        );

                        if (selectedClient) {
                            print(selectedClient);
                            inputRfc.value = selectedClient.rfc;
                            inputRfc.dispatchEvent(new Event('blur'));
                            inputRazonSocial.value = selectedClient.razonSocial;
                            inputRazonSocial.dispatchEvent(new Event('blur'));
                            inputCp.value = selectedClient.cp;
                            inputCp.dispatchEvent(new Event('blur'));

                            rfcList.classList.add('hide'); // Hide the list after selection
                        } else {
                            console.error('No client found for RFC:', selected);
                        }
                    });
                });

                // Additional debugging
                console.log('Total filtered options:', filtered.length);
            }
        }
    });
};

//------------------------------------------------------------------------------------------------------------------------

const noFrecuentRegisterListener = async () => {
    const client = await getDomElement(clientQuery);

    client.addEventListener('blur', async e => {
        const currentValue = e.target.value;
        console.log(lime);
        const rfcInput = await getDomElement(noFrequentElementQueries.rfc);

        if (currentValue === 'Otro') {
            if (document.querySelector('#saveButton') === null)
                insertSaveButton();
            if (document.querySelector('#rfcList') === null) {
                const rfcList = document.createElement('div');
                rfcList.id = 'rfcList';
                rfcList.classList.add('rfcListContainer', 'hide');

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
            }

            rfcInput.addEventListener('blur', noFrecuentSave);
            rfcInput.addEventListener('input', noFrecuentAutocomplete);
            rfcInput.addEventListener('blur', e =>
                rfcList.classList.add('hide')
            );
            // rfcInput.addEventListener('focus', e => {
            //     if (e.target.value !== '') {
            //         rfcList.classList.remove('hide');
            //         rfcInput.dispatchEvent(new Event('input'));
            //     }
            // });
        } else if (currentValue !== 'Otro') {
            rfcInput.removeEventListener('blur', noFrecuentSave);
            rfcInput.removeEventListener('input', noFrecuentAutocomplete);
            if (!document.querySelector('#saveButton') === null)
                document.querySelector('#saveButton').classList.add('hide');
        }
    });
};

noFrecuentRegisterListener();
