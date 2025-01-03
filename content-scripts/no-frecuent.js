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

const validRegimens = {
    601: 'General de Ley Personas Morales',
    603: 'Personas Morales con Fines no Lucrativos',
    605: 'Sueldos y Salarios e Ingresos Asimilados a Salarios',
    606: 'Arrendamiento',
    607: 'Régimen de Enajenación o Adquisición de Bienes',
    608: 'Demás ingresos',
    610: 'Residentes en el Extranjero sin Establecimiento Permanente en México',
    611: 'Ingresos por Dividendos (socios y accionistas)',
    612: 'Personas Físicas con Actividades Empresariales y Profesionales',
    614: 'Ingresos por intereses',
    615: 'Régimen de los ingresos por obtención de premios',
    616: 'Sin obligaciones fiscales',
    620: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos',
    621: 'Incorporación Fiscal',
    622: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
    623: 'Opcional para Grupos de Sociedades',
    624: 'Coordinados',
    625: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
    626: 'Régimen Simplificado de Confianza',
};

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
const isArrayEmpty = array => array.length === 0;
const print = (...value) => console.log(...value);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const areObjectsDifferente = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    // Si tienen diferente cantidad de claves
    if (keys1.length !== keys2.length) {
        return true;
    }

    // Comparar los valores de cada clave
    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return true; // Si hay al menos una diferencia
        }
    }

    return false; // Si no hay diferencias
};

const insertSaveButton = () => {
    // SE MUESTRA EL BOTON SI ME SALGO Y ENTRO ???
    if (!document.querySelector('#saveButton')) {
        const saveButton = document.createElement('button');
        saveButton.innerText = 'Guardar Cliente';
        saveButton.classList.add('saveButton', 'hide');
        saveButton.id = 'saveButton';
        saveButton.addEventListener('click', saveButtonHandler);
        try {
            const saveButtonColumn = document.querySelector(
                '#A135row7 > div.panel-body > div:nth-child(6)'
            );
            saveButtonColumn.appendChild(saveButton);
        } catch (error) {
            print('No se pudo insertar el botón de guardar' + error);
        }
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
            // e.stopPropagation();
            const rfcInput = noFrequentElements.rfc;

            if (e.target.classList.contains('opcionRfc')) {
                handleSelectClient(e);
            }
        });

        //Para insertar oculto
        rfcList.classList.add('hide');
    }
};

//-----------------------------------------------SAVE---------------------------------------------------------------------

const saveButtonHandler = e => {
    // Guarda o Actualiza los datos en el Storage por cada Usuario
    e.preventDefault();

    const saveButton = e.target;

    const clientElements = {
        rfc: noFrequentElements.rfc,
        razonSocial: noFrequentElements.razonSocial,
        cp: noFrequentElements.cp,
        regimenFiscal: noFrequentElements.regimenFiscal,
    };

    clientElements.usoFactura =
        clientElements.rfc.value.length === 12
            ? noFrequentElements.usoFacturaMoral
            : clientElements.rfc.value.length === 13
            ? noFrequentElements.usoFacturaFisica
            : null;

    const clientValues = Object.values(clientElements).map(elem => elem.value);

    if (
        !clientValues.every(
            value => value !== null && value !== undefined && value !== ''
        )
    ) {
        print('No se puede guardar, faltan datos');
        return;
    }

    if (
        !(
            clientElements.rfc.value.length >= 12 &&
            clientElements.rfc.value.length <= 13
        ) ||
        hasError(clientElements.rfc)
    ) {
        print('No se puede guardar, RFC tiene un formato inválido');
        return;
    }
    if (!clientElements.cp.value.length === 5 || hasError(clientElements.cp)) {
        print('No se puede guardar, CP tiene un formato inválido');
        return;
    }

    if (
        !Object.values(validRegimens).includes(
            clientElements.regimenFiscal.value
        ) ||
        hasError(clientElements.regimenFiscal)
    ) {
        print('No se puede guardar, Regimen Fiscal inválido');
        return;
    }

    if (
        !validUsoFactura.includes(clientElements.usoFactura.value) ||
        hasError(clientElements.usoFactura)
    ) {
        print('No se puede guardar, Uso de Factura inválido');
        return;
    }

    currentClient = new noFrecuentClient(...clientValues);

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
    });

    alert('Cliente Guardado');
};

//-------------------------------------------AUTOCOMPLETE-----------------------------------------------------------------

const handleSelectClient = async e => {
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
        await sleep(400);
        let regimenOption = document.querySelector('#ui-id-3 > li');
        if (regimenOption) {
            regimenOption.dispatchEvent(new Event('click', { bubbles: true }));
            inputRegimen.dispatchEvent(new Event('blur'));
        }

        const inputUsoFactura =
            inputRfc.value.length === 12
                ? noFrequentElements.usoFacturaMoral
                : noFrequentElements.usoFacturaFisica;

        inputUsoFactura.value = selectedClient.usoFactura;
        inputUsoFactura.dispatchEvent(new Event('focus'));

        await sleep(400);
        const useOption =
            inputRfc.value.length === 12
                ? document.querySelector('#ui-id-5 > li')
                : document.querySelector('#ui-id-6 > li');

        if (useOption) {
            useOption.dispatchEvent(new Event('click', { bubbles: true }));
            inputUsoFactura.dispatchEvent(new Event('blur'));
        }

    } else {
        console.error('No client found for RFC:', currentSelectedClient);
    }
};

const noFrecuentAutocomplete = e => {
    const currentValue = e.target.value.toUpperCase();

    print('ENTERED noFrecuentAutocomplete');

    chrome.storage.local.get(myRfc, result => {
        const savedData = result[myRfc] || [];

        if (!isArrayEmpty(savedData)) {
            const rfcList = document.querySelector('#rfcList');

            rfcList.innerHTML = '';

            let filtered = savedData.filter(
                elem => currentValue !== '' && elem.rfc.startsWith(currentValue)
            );

            if (!isArrayEmpty(filtered)) {
                filteredClients = [...filtered]; //

                if (e.isTrusted) rfcList.classList.remove('hide');

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

            rfcInput.removeEventListener('blur', saveOrUpdate);
            rfcInput.addEventListener('blur', saveOrUpdate);

            rfcInput.removeEventListener('input', noFrecuentAutocomplete);
            rfcInput.addEventListener('input', noFrecuentAutocomplete);

            rfcInput.addEventListener('focus', e => {
                if (e.target.value !== '') e.target.style.marginBottom = '0';
                document.querySelector('#rfcList').classList.remove('hide');
            });
            // OCULTAR DESPLEGABLE ???
            rfcInput.addEventListener('blur', async e => {
                const saveButton = document.querySelector('#saveButton');
                const list = document.querySelector('#rfcList');

                await sleep(300);
                list.classList.add('hide');
                e.target.style.marginBottom = '5px';

                if (
                    e.target.value.length >= 12 &&
                    e.target.value.length <= 13
                ) {
                    saveButton.classList.remove('hide');
                } else {
                    saveButton.classList.add('hide');
                }
            });
        } else {
            rfcInput.removeEventListener('blur', saveOrUpdate);
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

function saveOrUpdate(e) {
    if (!(e.target.value.length === 12 || e.target.value.length === 13)) {
        return;
    }

    const saveButton = document.getElementById('saveButton');

    chrome.storage.local.get(myRfc, result => {
        // Valida si existia previamente el cliente
        const noFrecuent = result[myRfc] || [];

        const clientFind = noFrecuent.find(
            client => client.rfc === e.target.value
        );

        saveButton.textContent = clientFind
            ? 'Actualizar Cliente'
            : 'Guardar Cliente';
    });
}
