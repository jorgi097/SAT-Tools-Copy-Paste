(async () => {
    const contentScript = await import(
        chrome.runtime.getURL('./content-scripts/pdf.js/build/pdf.mjs')
    );
    const contentScript2 = await import(
        chrome.runtime.getURL('./content-scripts/pdf.js/build/pdf.worker.mjs')
    );
})();

// Recibe un archivo PDF de la constancia de situación fiscal y retorna rfc, razonSocial, cp, regimenes fiscles
const extractDataFromCSF = async file => {
    const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
    const pdf = await loadingTask.promise;
    let content = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        content += textContent.items.map(item => item.str).join(' ') + '\n';
    }

    // Extraer datos específicos con expresiones regulares
    const rfcMatch = content.match(/RFC:\s+([\w\d]+)\s/);
    const razonSocialMatch = content.match(
        /Registro Federal de Contribuyentes\s+([A-ZÑ\s]+)\s/
    );
    const cpMatch = content.match(/Código Postal:\s+(\d{5})\s/);
    const regimensMatch = content.match(
        /Regímenes:\s+Régimen\s+Fecha Inicio\s+Fecha Fin\s+([\s\S]+?)(?=Obligaciones:|$)/
    );

    const rfc = rfcMatch ? rfcMatch[1] : 'No encontrado';
    const razonSocial = razonSocialMatch
        ? razonSocialMatch[1].trim()
        : 'No encontrado';
    const cp = cpMatch ? cpMatch[1] : 'No encontrado';

    const regimensExtracted = regimensMatch
        ? regimensMatch[1]
              .replace(/\d{2}\/\d{2}\/\d{4}/g, '')
              .split(/\s{2,}/)
              .filter(line => line.trim() && !line.includes('Página'))
        : ['No encontrado'];

    const regimens = regimensExtracted.map(regimen => {
        return (
            Object.values(validRegimens).find(validRegimen =>
                regimen.includes(validRegimen)
            ) || regimen
        );
    });

    return { rfc, razonSocial, cp, regimens };
};

const dropZone = document.querySelector('body');
const dragZone = document.createElement('div');

dragZone.classList.add('dragzone', 'hide');
const dragZoneMargin = document.createElement('div');
dragZone.appendChild(dragZoneMargin);
const dragZoneText = document.createElement('p');
dragZoneText.textContent = 'Suelta la Constancia de Situación Fiscal aquí';
dragZoneMargin.appendChild(dragZoneText);

dropZone.appendChild(dragZone);

dropZone.addEventListener('dragover', event => {
    event.preventDefault();
    if (dragZone.classList.contains('hide')) {
        dragZone.classList.remove('hide');
    }
});

dropZone.addEventListener('dragleave', event => {
    if (
        event.relatedTarget === null ||
        !dropZone.contains(event.relatedTarget)
    ) {
        dragZone.classList.add('hide');
    }
});

dropZone.addEventListener('drop', async event => {
    event.preventDefault(); // Evita que se recargue la pagina

    // Verificar que el archivo sea un PDF
    const file = event.dataTransfer.files[0];
    if (!file || file.type !== 'application/pdf') {
        print('Please drop a PDF file.');
        return;
    }

    dragZone.classList.add('hide');

    let extractedData = await extractDataFromCSF(file);

    const inputRfc = noFrequentElements.rfc;
    const inputRazonSocial = noFrequentElements.razonSocial;
    const inputCp = noFrequentElements.cp;
    const inputRegimen = noFrequentElements.regimenFiscal;
    const client = noFrequentElements.noFrecuentClient;

    client.value = 'Otro';
    client.dispatchEvent(new Event('focus'));
    await sleep(300);
    document
        .querySelector('#ui-id-2 li')
        .dispatchEvent(new Event('click', { bubbles: true }));
    await sleep(300);
    client.dispatchEvent(new Event('blur', { bubbles: true }));
    document.activeElement.blur();

    await sleep(300);
    if (extractedData.rfc !== 'No encontrado') {
        inputRfc.dispatchEvent(new Event('focus'));
        inputRfc.value = extractedData.rfc;
        inputRfc.dispatchEvent(new Event('input', { bubbles: true }));
        inputRfc.dispatchEvent(new Event('blur', { bubbles: true }));
    }
    if (extractedData.razonSocial !== 'No encontrado') {
        inputRazonSocial.dispatchEvent(new Event('focus'));
        inputRazonSocial.value = extractedData.razonSocial;
        inputRazonSocial.dispatchEvent(new Event('input', { bubbles: true }));
        inputRazonSocial.dispatchEvent(new Event('blur', { bubbles: true }));
    }
    if (extractedData.cp !== 'No encontrado') {
        inputCp.dispatchEvent(new Event('focus'));
        inputCp.value = extractedData.cp;
        inputCp.dispatchEvent(new Event('input', { bubbles: true }));
        inputCp.dispatchEvent(new Event('blur', { bubbles: true }));
    }
    if (extractedData.regimens[0] !== 'No encontrado') {
        inputRegimen.dispatchEvent(new Event('focus'));
        inputRegimen.value = extractedData.regimens[0];
        await sleep(500);
        let regimenOption = document.querySelector('#ui-id-3 > li');
        if (regimenOption) {
            regimenOption.dispatchEvent(new Event('click', { bubbles: true }));
            inputRegimen.dispatchEvent(new Event('blur', { bubbles: true }));
        }
        await sleep(500);
        const inputUsoFactura =
            inputRfc.value.length === 12
                ? noFrequentElements.usoFacturaMoral
                : noFrequentElements.usoFacturaFisica;

        console.log(document.activeElement);
        if (inputUsoFactura) {
            inputUsoFactura.dispatchEvent(new Event('focus'), {
                bubbles: false,
            });
            inputUsoFactura.focus();
        }
    }
});
