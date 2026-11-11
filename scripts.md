# Lista de scripts usados para obtener datos

<details>
  <summary>Obtener informacion de Inputs y Botones</summary>

``` js
// 1. Función para obtener el identificador legible
function getIdentificador(el) {
const tag = el.tagName.toLowerCase();

if (tag === 'li') {
  if (el.dataset.label) return el.dataset.label;
  const clone = el.cloneNode(true);
  clone.querySelectorAll('ul, ol').forEach(nested => nested.remove());
  const texto = clone.innerText.trim();
  if (texto) return texto;
  return 'Elemento de lista sin texto';
}

if (tag === 'a') {
  const textoEnlace = el.innerText.trim();
  if (textoEnlace) return textoEnlace;
  if (el.title) return el.title;
  const liPadre = el.closest('li');
  if (liPadre && liPadre.innerText.trim()) return liPadre.innerText.trim();
  if (el.href) return el.href;
}

if (tag === 'button') {
  if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
  const texto = el.innerText.trim();
  if (texto) return texto;
  if (el.title) return el.title;
  if (el.value) return el.value;
  return 'Botón sin texto';
}

// Inputs / selects / textareas
if (el.id) {
  const label = Array.from(document.querySelectorAll('label')).find(l => l.htmlFor === el.id);
  if (label && label.innerText.trim()) return label.innerText.trim();
}

const parentLabel = el.closest('label');
if (parentLabel) {
  const clone = parentLabel.cloneNode(true);
  const inputClone = clone.querySelector('input, select, textarea');
  if (inputClone) inputClone.remove();
  const text = clone.innerText.trim();
  if (text) return text;
}

if (el.placeholder) return el.placeholder;
if (el.name) return el.name;

const td = el.closest('td');
if (td && td.previousElementSibling) {
  const text = td.previousElementSibling.innerText.trim();
  if (text) return text;
}

const formGroup = el.closest('.form-group, .row, div');
if (formGroup) {
  const labelText = formGroup.querySelector('label, span, strong, b');
  if (labelText && labelText.innerText.trim()) return labelText.innerText.trim();
}

return 'Elemento-' + (el.id || el.name || el.className || 'sin-id');
}

// 2. Función para obtener información de la lista padre (solo lo necesario)
function getInfoListaPadre(el) {
const tag = el.tagName.toLowerCase();
const li = tag === 'li' ? el : el.closest('li');
const lista = li ? li.closest('ul, ol') : null;

if (!lista) return null;

// Buscar título de la lista
let tituloLista = null;
const elementoAnterior = lista.previousElementSibling;
if (elementoAnterior) {
  const tagAnt = elementoAnterior.tagName.toLowerCase();
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'legend', 'strong', 'b', 'p'].includes(tagAnt)) {
    const texto = elementoAnterior.innerText.trim();
    if (texto) tituloLista = texto;
  }
}
if (!tituloLista) {
  const figcaption = lista.parentElement?.querySelector('figcaption, caption');
  if (figcaption && figcaption.innerText.trim()) {
    tituloLista = figcaption.innerText.trim();
  }
}

return {
  tipo: lista.tagName.toLowerCase(),
  titulo_lista: tituloLista,
  total_items: lista.querySelectorAll(':scope > li').length,
  selector_lista: getUniqueSelector(lista)
};
}

// 3. Función para generar un selector CSS único
function getUniqueSelector(el) {
if (el.id) return `#${CSS.escape(el.id)}`;

if (el.name) {
  const selector = `${el.tagName.toLowerCase()}[name="${CSS.escape(el.name)}"]`;
  if (document.querySelectorAll(selector).length === 1) return selector;
}

if (el.className && typeof el.className === 'string') {
  const classes = el.className.trim().split(/\s+/).map(c => `.${CSS.escape(c)}`).join('');
  const selector = `${el.tagName.toLowerCase()}${classes}`;
  if (document.querySelectorAll(selector).length === 1) return selector;
}

let path = [];
let current = el;
while (current && current.nodeType === Node.ELEMENT_NODE) {
  let selector = current.tagName.toLowerCase();
  if (current.id) {
    selector = `#${CSS.escape(current.id)}`;
    path.unshift(selector);
    break;
  } else {
    let sibling = current;
    let nth = 1;
    while (sibling.previousElementSibling) {
      sibling = sibling.previousElementSibling;
      if (sibling.tagName === current.tagName) nth++;
    }
    selector += `:nth-of-type(${nth})`;
  }
  path.unshift(selector);
  current = current.parentNode;
}
return path.join(' > ');
}

// 4. Handler con DELEGACIÓN DE EVENTOS
function manejarClickDelegado(event) {
const elemento = event.target.closest('input, select, textarea, a, li, button');
if (!elemento) return;

const tag = elemento.tagName.toLowerCase();

// Valor según el tipo de elemento
let valor;
if (tag === 'input' || tag === 'textarea') {
  valor = (elemento.type === 'checkbox' || elemento.type === 'radio')
          ? elemento.checked
          : elemento.value;
} else if (tag === 'select') {
  valor = elemento.value;
} else if (tag === 'a') {
  valor = elemento.href;
} else if (tag === 'li') {
  valor = elemento.dataset.value || elemento.innerText.trim();
} else if (tag === 'button') {
  valor = elemento.innerText.trim() || elemento.value || elemento.type;
}

// Construir el objeto base (campos comunes)
const info = {
  tag: tag,
  nombre_legible: getIdentificador(elemento),
  selector_css: getUniqueSelector(elemento),
  id: elemento.id || null,
  valor_actual: valor
};

// Si es un <li>, añadir los campos específicos de la lista
if (tag === 'li') {
  const infoLista = getInfoListaPadre(elemento);
  if (infoLista) {
    info.tipo = infoLista.tipo;
    info.titulo_lista = infoLista.titulo_lista;
    info.total_items = infoLista.total_items;
    info.selector_lista = infoLista.selector_lista;
  }
}

// Log destacado para <li>
if (tag === 'li') {
  console.log('%c📋 Click en <li>', 'background: #2563eb; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;', info);
} else {
  console.log(`🖱️ Click en <${tag}>:`, info);
}
}

// 5. Adjuntar UN SOLO listener al document (Delegación)
document.addEventListener('click', manejarClickDelegado, true);

console.log('✅ Delegación activada para: input, select, textarea, a, li, button.');
```
</details>

<details>
  <summary>Obtener informacion de Listas y Selects</summary>
  
``` js
// Función para generar un selector CSS único
function getUniqueSelector(el) {
  if (el.id) return `#${CSS.escape(el.id)}`;

  if (el.name) {
    const selector = `${el.tagName.toLowerCase()}[name="${CSS.escape(el.name)}"]`;
    if (document.querySelectorAll(selector).length === 1) return selector;
  }

  if (el.className && typeof el.className === 'string') {
    const classes = el.className.trim().split(/\s+/).map(c => `.${CSS.escape(c)}`).join('');
    const selector = `${el.tagName.toLowerCase()}${classes}`;
    if (document.querySelectorAll(selector).length === 1) return selector;
  }

  let path = [];
  let current = el;
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector = `#${CSS.escape(current.id)}`;
      path.unshift(selector);
      break;
    } else {
      let sibling = current;
      let nth = 1;
      while (sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling;
        if (sibling.tagName === current.tagName) nth++;
      }
      selector += `:nth-of-type(${nth})`;
    }
    path.unshift(selector);
    current = current.parentNode;
  }
  return path.join(' > ');
}

// Función para obtener todas las opciones de un select
function getOpcionesSelect(selectEl) {
  const opciones = [];
  const options = selectEl.querySelectorAll('option');
  
  options.forEach((option) => {
    opciones.push({
      nombre: option.innerText.trim(),
      valor: option.value,
      id: option.id || null,
      selector: getUniqueSelector(option)
    });
  });
  
  return opciones;
}

// Función para obtener todos los items de una lista (ul/ol)
function getItemsLista(listaEl) {
  const items = [];
  const lis = listaEl.querySelectorAll(':scope > li');
  
  lis.forEach((li) => {
    const clone = li.cloneNode(true);
    clone.querySelectorAll('ul, ol').forEach(nested => nested.remove());
    const texto = clone.innerText.trim();
    
    const enlace = li.querySelector('a');
    const valor = enlace ? enlace.href : (li.dataset.value || texto);
    
    items.push({
      nombre: texto,
      valor: valor,
      id: li.id || null,
      selector: getUniqueSelector(li)
    });
  });
  
  return items;
}

// Handler con DELEGACIÓN DE EVENTOS
function manejarClickDelegado(event) {
  const elemento = event.target.closest('ul, ol, select, option');
  if (!elemento) return;
  
  const tag = elemento.tagName.toLowerCase();
  let info = null;

  if (tag === 'select' || tag === 'option') {
    const select = tag === 'select' ? elemento : elemento.closest('select');
    if (select) {
      info = {
        nombre: "", // <-- NUEVO: campo vacío al inicio
        tag: 'select',
        id: select.id || null,
        selector: getUniqueSelector(select), // Selector del select
        opciones: getOpcionesSelect(select)
      };
    }
  }

  if (tag === 'ul' || tag === 'ol') {
    info = {
      nombre: "", // <-- NUEVO: campo vacío al inicio
      tag: tag,
      id: elemento.id || null,
      selector: getUniqueSelector(elemento), // Selector de la lista
      items: getItemsLista(elemento)
    };
  }

  if (tag === 'li') {
    const lista = elemento.closest('ul, ol');
    if (lista) {
      info = {
        nombre: "", // <-- NUEVO: campo vacío al inicio
        tag: lista.tagName.toLowerCase(),
        id: lista.id || null,
        selector: getUniqueSelector(lista), // Selector de la lista padre
        items: getItemsLista(lista)
      };
    }
  }

  if (info) {
    if (info.opciones) {
      console.log('%c📋 SELECT - Todas las opciones:', 'background: #9333ea; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold;', info);
    } else if (info.items) {
      console.log('%c📋 LISTA - Todos los items:', 'background: #2563eb; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold;', info);
    }
    
    // Imprimir como JSON formateado
    console.log(JSON.stringify(info, null, 2));
  }
}

document.addEventListener('click', manejarClickDelegado, true);

console.log('✅ Delegación activada SOLO para: ul, ol, select, option, li. Muestra todas las opciones/items con nombre, valor, id y selector.');
```
</details>