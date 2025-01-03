(async () => {
    const contentScript = await import(
        chrome.runtime.getURL('./content-scripts/pdf.js/build/pdf.mjs')
    );
    const contentScript2 = await import(
        chrome.runtime.getURL('./content-scripts/pdf.js/build/pdf.worker.mjs')
    );
})();

const dropZone = document.querySelector('body');

dropZone.addEventListener('dragover', event => {
    event.preventDefault();
});

dropZone.addEventListener('drop', async event => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    let extractedData = await extractDataFromCSF(event.dataTransfer.files[0]);

    extractedData.regimens = extractedData.regimens.filter(regimen => {
        return Object.values(validRegimens).some(regimenItem =>
            regimen.includes(regimenItem)
        );
    });
    console.log(extractedData);

    const inputRfc = noFrequentElements.rfc;
    const inputRazonSocial = noFrequentElements.razonSocial;
    const inputCp = noFrequentElements.cp;
    const inputRegimen = noFrequentElements.regimenFiscal;
    const client = noFrequentElements.noFrecuentClient;

    client.value = 'Otro';
    client.dispatchEvent(new Event('focus'));
    setTimeout(() => {
        document
            .querySelector('#ui-id-2 li')
            .dispatchEvent(new Event('click', { bubbles: true }));
        client.dispatchEvent(new Event('blur', { bubbles: true }));
        document.activeElement.blur();
    }, 600);

    setTimeout(() => {
        if (extractedData.rfc !== 'No encontrado') {
            inputRfc.dispatchEvent(new Event('focus'));
            inputRfc.value = extractedData.rfc;
            inputRfc.dispatchEvent(new Event('input', { bubbles: true }));
            inputRfc.dispatchEvent(new Event('blur', { bubbles: true }));
        }
        if (extractedData.razonSocial !== 'No encontrado') {
            inputRazonSocial.dispatchEvent(new Event('focus'));
            inputRazonSocial.value = extractedData.razonSocial;
            inputRazonSocial.dispatchEvent(
                new Event('input', { bubbles: true })
            );
            inputRazonSocial.dispatchEvent(
                new Event('blur', { bubbles: true })
            );
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
            setTimeout(() => {
                let regimenOption = document.querySelector('#ui-id-3 > li');
                if (regimenOption) {
                    regimenOption.dispatchEvent(
                        new Event('click', { bubbles: true })
                    );
                    inputRegimen.dispatchEvent(
                        new Event('blur', { bubbles: true })
                    );
                }
                setTimeout(() => {
                    const inputUsoFactura =
                        inputRfc.value.length === 12
                            ? noFrequentElements.usoFacturaMoral
                            : noFrequentElements.usoFacturaFisica;

                    if (inputUsoFactura) {
                        inputUsoFactura.dispatchEvent(new Event('focus'));
                    }
                }, 800);
            }, 800);
        }
    }, 1000);
});

async function extractDataFromCSF(file) {
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
    const regimens = regimensMatch
        ? regimensMatch[1]
              .replace(/\d{2}\/\d{2}\/\d{4}/g, '')
              .split(/\s{2,}/)
              .filter(line => line.trim() && !line.includes('Página'))
        : ['No encontrado'];

    return { rfc, razonSocial, cp, regimens };
}
