const tieneImpuestos = document.querySelector('#\\31 35select115');
tieneImpuestos.value = '02';
tieneImpuestos.dispatchEvent(new Event('change', { bubbles: true }));

const aceptarSugerencia = document.querySelector('#\\31 35checkbox145');
if (aceptarSugerencia.checked) {
  aceptarSugerencia.dispatchEvent(
    new PointerEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );
}

const ivaRetencion = document.querySelector('#\\31 35checkbox166');
if (ivaRetencion.checked) {
  ivaRetencion.dispatchEvent(
    new PointerEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );
}

const isrRetencion = document.querySelector("#\\31 35checkbox176");
if (isrRetencion.checked) {
  isrRetencion.dispatchEvent(
    new PointerEvent('click', { bubbles: true, cancelable: true, view: window }),
  );
}

let descripcionDetallada = document.querySelector("#\\31 35textboxautocomplete113");
descripcionDetallada.addEventListener('input', (e) => e.target.value = e.target.value.toUpperCase());



let tipoFacturaElement = document.querySelector("#itemdeCintillo33");
tipoFactura = tipoFactura.textContent.trim().toLowerCase();
//Crear mutationobserver
//Si es "pago" Poner la seerie en P
//Si es "ingreso" Poner serie F y el uso de cfdi como "gastos en general" sobrescribiendo cualquier valor guardado

// En recepcion de pagos
let monedaPago = document.querySelector("#\\31 56textboxautocomplete19");
monedaPago.value = 'Peso Mexicano';
//dispatchevent change, blur etc


//fecha de pago en alert en  recepcion de pagos al inicio y quitar alert al cambiar la fecha de pago
let fechaPago = document.querySelector("#\\31 56date16");
fechapago.classList.add("alert");
fechapago.addEventListener('change', (e) => {e.target.classList.remove("alert");})

// fecha de pago en rojo en listado final
Array.from(document.querySelectorAll('[columna="grid_1560001_\\$7FECHAPAGO"]')).forEach(e => e.style.backgroundColor = "red")


let primerNavBar = document.querySelector("body > nav");
primerNavBar.parentElement.removeChild(primerNavBar)

let primerHeader = document.querySelector("body > header")
primerHeader.parentElement.removeChild(primerHeader)

let segundoNavBar = document.querySelector("body > div.navbar.navbar-inverse.sub-navbar.navbar-fixed-top")
segundoNavBar.style.marginTop = 0;

let encabezado = document.querySelector("body > div.container.margin-menu-encabezado")
encabezado.classList.remove('margin-menu-encabezado')