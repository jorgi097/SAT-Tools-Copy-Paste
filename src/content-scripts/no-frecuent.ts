export interface NoFrecuentClientData {
  rfc: string;
  razonSocial: string;
  cp: string;
  regimenFiscal: string;
  usoFactura?: string;
}

export const noFrequentElementsQueries: Record<string, string> = {
  rfc: '#\\31 35textbox59',
  razonSocial: '#\\31 35textbox60',
  cp: '#\\31 35textbox61',
  regimenFiscal: '#\\31 35textboxautocomplete62',
  usoFacturaFisica: '#\\31 35textboxautocomplete72',
  usoFacturaMoral: '#\\31 35textboxautocomplete71',
  noFrecuentClient: '#\\31 35textboxautocomplete55',
  myRfc: '.detalleUsuario span',
};

export const validRegimens: Record<number, string> = {
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
  622: 'Actividades Agrícolas, Ganaderas, Silvículas y Pesqueras',
  623: 'Opcional para Grupos de Sociedades',
  624: 'Coordinados',
  625: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
  626: 'Régimen Simplificado de Confianza',
};

export const noFrequentElements: Record<string, HTMLInputElement | HTMLElement | null> = {};
let filteredClients: NoFrecuentClientData[] = [];
let myRfc: string = '';

export class NoFrecuentClient implements NoFrecuentClientData {
  rfc: string;
  razonSocial: string;
  cp: string;
  regimenFiscal: string;
  usoFactura?: string;

  constructor(rfc = '', razonSocial = '', cp = '', regimenFiscal = '', usoFactura = '') {
    this.rfc = rfc;
    this.razonSocial = razonSocial;
    this.cp = cp;
    this.regimenFiscal = regimenFiscal;
    this.usoFactura = usoFactura;
  }
}

let currentClient = new NoFrecuentClient();

const hasError = (element: HTMLElement | null) => element?.classList.contains('alert') ?? false;
const isArrayEmpty = <T>(array: T[]) => array.length === 0;
const print = (...value: unknown[]) => console.log(...value);
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const insertSaveButton = () => {
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
      if (saveButtonColumn) {
        saveButtonColumn.appendChild(saveButton);
      }
    } catch (error) {
      print('No se pudo insertar el botón de guardar: ' + error);
    }
  }
};

const insertList = () => {
  const rfcInput = noFrequentElements.rfc as HTMLInputElement | null;
  if (!rfcInput) return;

  if (!document.querySelector('#rfcList')) {
    const rfcList = document.createElement('div');
    rfcList.id = 'rfcList';
    rfcList.classList.add('rfcListContainer');

    const optionsSizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const computedWidth = window.getComputedStyle(entry.target).width;
        rfcList.style.width = computedWidth;
      }
    });
    optionsSizeObserver.observe(rfcInput);

    rfcInput.insertAdjacentElement('afterend', rfcList);

    rfcList.addEventListener('click', e => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      if (target.classList.contains('opcionRfc')) {
        handleSelectClient(e);
      }
    });

    rfcList.classList.add('hide');
  }
};

const saveButtonHandler = (e: MouseEvent) => {
  e.preventDefault();

  const clientElements = {
    rfc: noFrequentElements.rfc as HTMLInputElement,
    razonSocial: noFrequentElements.razonSocial as HTMLInputElement,
    cp: noFrequentElements.cp as HTMLInputElement,
    regimenFiscal: noFrequentElements.regimenFiscal as HTMLInputElement,
  };

  const clientValues = Object.values(clientElements).map(elem => elem?.value);

  if (!clientValues.every(value => value !== null && value !== undefined && value !== '')) {
    print('No se puede guardar, faltan datos');
    return;
  }

  if (
    !(clientElements.rfc.value.length >= 12 && clientElements.rfc.value.length <= 13) ||
    hasError(clientElements.rfc)
  ) {
    print('No se puede guardar, RFC tiene un formato inválido');
    return;
  }
  if (clientElements.cp.value.length !== 5 || hasError(clientElements.cp)) {
    print('No se puede guardar, CP tiene un formato inválido');
    return;
  }

  if (
    !Object.values(validRegimens).includes(clientElements.regimenFiscal.value) ||
    hasError(clientElements.regimenFiscal)
  ) {
    print('No se puede guardar, Regimen Fiscal inválido');
    return;
  }

  currentClient = new NoFrecuentClient(
    clientElements.rfc.value,
    clientElements.razonSocial.value,
    clientElements.cp.value,
    clientElements.regimenFiscal.value
  );

  chrome.storage.local.get(myRfc, result => {
    const noFrecuent: NoFrecuentClientData[] = result[myRfc] || [];

    const index = noFrecuent.findIndex(
      client => client.rfc === currentClient.rfc
    );

    if (index !== -1) {
      noFrecuent[index] = currentClient;
    } else {
      noFrecuent.push(currentClient);
    }

    chrome.storage.local.set({ [myRfc]: noFrecuent });
  });

  alert('Cliente Guardado');
};

const handleSelectClient = async (e: Event) => {
  const target = e.target as HTMLElement;
  const currentSelectedClient = target.textContent;
  print('ENTERED handleSelectClient');

  const inputRfc = noFrequentElements.rfc as HTMLInputElement;
  const inputRazonSocial = noFrequentElements.razonSocial as HTMLInputElement;
  const inputCp = noFrequentElements.cp as HTMLInputElement;
  const inputRegimen = noFrequentElements.regimenFiscal as HTMLInputElement;

  const selectedClient = filteredClients.find(
    elem => elem.rfc === currentSelectedClient
  );

  if (selectedClient && inputRfc && inputRazonSocial && inputCp && inputRegimen) {
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
    const regimenOption = document.querySelector('#ui-id-3 > li');
    if (regimenOption) {
      regimenOption.dispatchEvent(new Event('click', { bubbles: true }));
      inputRegimen.dispatchEvent(new Event('blur'));
    }
  } else {
    console.error('No client found for RFC:', currentSelectedClient);
  }
};

const noFrecuentAutocomplete = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const currentValue = target.value.toUpperCase();

  print('ENTERED noFrecuentAutocomplete');

  chrome.storage.local.get(myRfc, result => {
    const savedData: NoFrecuentClientData[] = result[myRfc] || [];

    if (!isArrayEmpty(savedData)) {
      const rfcList = document.querySelector('#rfcList');
      if (!rfcList) return;

      rfcList.innerHTML = '';

      const filtered = savedData.filter(
        elem => currentValue !== '' && elem.rfc.startsWith(currentValue)
      );

      if (!isArrayEmpty(filtered)) {
        filteredClients = [...filtered];

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

const registerClientListener = () => {
  const client = noFrequentElements.noFrecuentClient as HTMLInputElement | null;
  if (!client) return;

  client.addEventListener('blur', (e: Event) => {
    const target = e.target as HTMLInputElement;
    const currentValue = target.value;
    const rfcInput = noFrequentElements.rfc as HTMLInputElement | null;
    if (!rfcInput) return;

    if (currentValue === 'Otro') {
      insertSaveButton();
      insertList();

      rfcInput.removeEventListener('blur', saveOrUpdate);
      rfcInput.addEventListener('blur', saveOrUpdate);

      rfcInput.removeEventListener('input', noFrecuentAutocomplete);
      rfcInput.addEventListener('input', noFrecuentAutocomplete);

      rfcInput.addEventListener('focus', (e: Event) => {
        const t = e.target as HTMLInputElement;
        if (t.value !== '') t.style.marginBottom = '0';
        document.querySelector('#rfcList')?.classList.remove('hide');
      });

      rfcInput.addEventListener('blur', async (e: Event) => {
        const t = e.target as HTMLInputElement;
        const saveButton = document.querySelector('#saveButton');
        const list = document.querySelector('#rfcList');

        await sleep(300);
        list?.classList.add('hide');
        t.style.marginBottom = '5px';

        if (t.value.length >= 12 && t.value.length <= 13) {
          saveButton?.classList.remove('hide');
        } else {
          saveButton?.classList.add('hide');
        }
      });
    } else {
      rfcInput.removeEventListener('blur', saveOrUpdate);
      rfcInput.removeEventListener('input', noFrecuentAutocomplete);

      const saveButton = document.querySelector('#saveButton');
      if (saveButton !== null) {
        saveButton.classList.add('hide');
      }
    }
  });
};

function saveOrUpdate(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!(target.value.length === 12 || target.value.length === 13)) {
    return;
  }

  const saveButton = document.getElementById('saveButton');
  if (!saveButton) return;

  chrome.storage.local.get(myRfc, result => {
    const noFrecuent: NoFrecuentClientData[] = result[myRfc] || [];

    const clientFind = noFrecuent.find(
      client => client.rfc === target.value
    );

    saveButton.textContent = clientFind
      ? 'Actualizar Cliente'
      : 'Guardar Cliente';
  });
}

const checkElementExists = setInterval(() => {
  Object.entries(noFrequentElementsQueries).forEach(([key, query]) => {
    if (!noFrequentElements[key]) {
      try {
        noFrequentElements[key] = document.querySelector<HTMLElement>(query);
      } catch (error) {
        // Ignorar selectores no válidos en contexto actual
      }
    }
  });

  const allElementsLoaded = Object.keys(noFrequentElementsQueries).every(
    (key) => {
      return (
        noFrequentElements[key] !== null &&
        noFrequentElements[key] !== undefined
      );
    }
  );

  if (allElementsLoaded) {
    clearInterval(checkElementExists);
    const myRfcText = noFrequentElements.myRfc?.textContent || '';
    const match = myRfcText.match(/^[^\s|]+/);
    if (match) {
      myRfc = match[0];
      registerClientListener();
    }
  }
}, 3000);
