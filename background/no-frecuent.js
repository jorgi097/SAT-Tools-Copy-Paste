const rfcNoFrecuentId = '135textbox59',
    razonSocialId = '135textbox60',
    cpId = '135textbox61',
    regimenFiscalId = '135textboxautocomplete62',
    usoFacturaNoFrecuentId = '135textboxautocomplete72';

function hasError(element) {
    return element.classList.contains('alert');
}

class noFrecuentClient {
    rfc;
    razonSocial;
    cp;
    regimenFiscal;
    usoFactura;
}

const currentClient = new noFrecuentClient();

function noFrecuent(e) {
    const currentElement = e.target;
    const currentTrigger = e.target.id;
    setTimeout(() => {
        if (currentTrigger === rfcNoFrecuentId) {
            if (!hasError(currentElement)) {
                currentClient.rfc = e.target.value;
                console.log(`Correcto: ${e.target.value}`);
            } else {
                currentClient.rfc = '';
                console.log(`Incorrecto: ${e.target.value}`);
            }
        } else if (currentTrigger === razonSocialId) {
            if (!hasError(currentElement)) {
                currentClient.razonSocial = e.target.value;
                console.log(`Correcto: ${e.target.value}`);
            } else {
                currentClient.razonSocial = '';
                console.log(`Incorrecto: ${e.target.value}`);
            }
        } else if (currentTrigger === cpId) {
            if (!hasError(currentElement)) {
                currentClient.cp = e.target.value;
                console.log(`Correcto: ${e.target.value}`);
            } else {
                currentClient.cp = '';
                console.log(`Incorrecto: ${e.target.value}`);
            }
        } else if (currentTrigger === regimenFiscalId) {
            if (!hasError(currentElement)) {
                currentClient.regimenFiscal = e.target.value;
                console.log(`Correcto: ${e.target.value}`);
            } else {
                currentClient.regimenFiscal = '';
                console.log(`Incorrecto: ${e.target.value}`);
            }
        } else if (currentTrigger === usoFacturaNoFrecuentId) {
            if (!hasError(currentElement)) {
                currentClient.usoFactura = e.target.value;
                console.log(`Correcto: ${e.target.value}`);
            } else {
                currentClient.usoFactura = '';
                console.log(`Incorrecto: ${e.target.value}`);
            }
        }
        if (
            Object.values(currentClient).every(
                val => val !== null && val !== undefined && val !== ''
            )
        ) {
            let print = Object.values(currentClient).toString();
            console.log(`Completo: ${print}`);
        }
    }, 1200);
}

async function noFrecuentAutocomplete() {
    const client = await getDomElement(clientQuery);
    client.addEventListener('blur', async e => {
        const currentValue = e.target.value;
        const rfc = await getDomElement(rfcNoFrecuentQuery);
        const razonSocial = await getDomElement(razonSocialQuery);
        const cp = await getDomElement(cpQuery);
        const regimenFiscal = await getDomElement(regimenFiscalQuery);
        const usoFactura = await getDomElement(usoFacturaNoFrecuentQuery);

        const clientVariables = [
            rfc,
            razonSocial,
            cp,
            regimenFiscal,
            usoFactura,
        ];

        if (currentValue === 'Otro') {
            clientVariables.forEach(element => {
                element.addEventListener('blur', noFrecuent);
            });
        } else {
            if (currentValue === 'Otro') {
                clientVariables.forEach(element => {
                    element.removeEventListener('blur', noFrecuent);
                });
            }
        }
    });
}

noFrecuentAutocomplete();
