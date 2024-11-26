let clienteFrecuente = document.querySelector("#\\31 35textboxautocomplete55"); // Campo de cliente frecuente
let cp = document.querySelector("#\\31 35textbox61"); // Codigo Postal normal o a registrar
let usoFactura = document.querySelector("#\\31 35textboxautocomplete72"); // Uso factura a registrar
let regimenFiscal = document.querySelector("#\\31 35textboxautocomplete62"); // Regimen Fiscal normal o a registrar
let optionsUl = document.querySelector("#ui-id-2");
let optionsLi = optionsUl.querySelectorAll("li");
let clientesFrecuentes = Array.from(optionsLi).map((li) => li.textContent); // Array clientes frecuentes
let excluirFrecuentes = ["XAXX010101000", "XEXX010101000", "Otro"]; // Elementos a exluir de clientes frecuentes
let rfc = document.querySelector("#\\31 35textbox59"); // RFC a registrar
let razonSocial = document.querySelector("#\\31 35textbox60"); // Razon Social a registrar
let validationTimeOut = 500;


function hasError(element) {
    console.log("Has error: ");
    console.dir(element);
    return element.classList.contains("alert");
}

function validateRfc(e) {
    setTimeout(() => {
        let currentRfc = e.target.value;
        if (
            currentRfc !== "" &&
            (currentRfc.length === 12 || currentRfc.length === 13) &&
            !hasError(rfc)
        ) {
            console.log("RFC Valido: " + currentRfc);
            console.dir(rfc);
        } else {
            console.log("RFC Invalido: " + currentRfc);
            console.dir(rfc);
        }
    }, validationTimeOut);
}

function validateCp(e) {
    setTimeout(() => {
        let currentCp = e.target.value;
        if (currentCp !== "" && currentCp.length === 5 && !hasError(cp)) {
            console.log("CP Valido: " + currentCp);
        } else {
            console.log("CP Invalido: " + currentCp);
        }
    },validationTimeOut);
}

function validateRazonSocial(e) {
    setTimeout(() => {
        let currentRazonSocial = e.target.value;
        if (
            currentRazonSocial !== "" &&
            !hasError(razonSocial)
        ) {
            console.log("razonSocial Valido: " + currentRazonSocial);
        } else {
            console.log("razonSocial Invalido: " + currentRazonSocial);
        }
    },validationTimeOut);
}

function validateRegimenFiscal(e) {
    setTimeout(() => {
        let currentRegimenFiscal = e.target.value;
        let currentRfc = rfc.value;

        if (currentRfc.length === 13) {
            // VALIDAR QUE SOLO SE PUEDAN SELECCIONAR REGIMENES DE PERSONA FISICA
            console.log("RFC persona fisica: " + currentRegimenFiscal);
        } else if (currentRfc.length === 12) {
            // VALIDAR QUE SOLO SE PUEDAN SELECCIONAR REGIMENES DE PERSONA MORAL
            console.log("RFC persona moral: " + currentRegimenFiscal);
        }
    },validationTimeOut);
}

function registerRfc(e) {
    let currentValue = e.target.value;
    if (currentValue === "Otro") {
        rfc.addEventListener("blur", validateRfc);
        razonSocial.addEventListener("blur", validateRazonSocial);
        cp.addEventListener("blur", validateCp);
        regimenFiscal.addEventListener("blur", validateRegimenFiscal);
    }
}

// clienteFrecuente.addEventListener("blur", (e) => {
//     // LOGICA PARA AUTOCOMPLETAR CODIGO POSTAL Y REGIMEN FISCAL
//     let currentValue = e.target.value;

//     if (
//         currentValue !== "" &&
//         !excluirFrecuentes.includes(currentValue) &&
//         clientesFrecuentes.includes(currentValue)
//     ) {
//         console.log("Opcion valida " + currentValue);
//         cp.value = "45070"; // CAMBIAR POR LOGICA DE CONSULTA A LOCAL STORAGE
//     }
// });

clienteFrecuente.addEventListener("blur", registerRfc);
