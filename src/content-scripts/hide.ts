import { getDomElement } from '../utils/dom';

const hideQueries: Record<string, string> = {
  footer: '.main-footer',
  space: 'body > div:nth-child(162)',
  privacidad: 'body > div:nth-child(10) > div:nth-child(6)',
  primerNavBar: 'body > nav',
  primerHeader: 'body > header',
  version: 'body > div:nth-child(5) > div > div.col-sm-6 > span',
  comprobanteTitle: '#Comprobante > div:nth-child(1) > h5',
  divisor: 'body > div:nth-child(5) > div > div.col-sm-2',
  addenda: '#GeneraAdenda',
};

async function hideElements(): Promise<void> {
  const removeUseless = await Promise.all(
    Object.values(hideQueries).map(query => getDomElement(query))
  );
  removeUseless.forEach(elem => {
    if (elem) {
      elem.style.display = 'none';
    }
  });
}

async function transformElements(): Promise<void> {
  const segundoNavBar = await getDomElement('body > div.navbar.navbar-inverse.sub-navbar.navbar-fixed-top');
  if (segundoNavBar) segundoNavBar.style.marginTop = '0';

  const encabezadoWrapper = await getDomElement('body > div.container.margin-menu-encabezado');
  if (encabezadoWrapper) encabezadoWrapper.classList.remove('margin-menu-encabezado');

  const encabezadoContent = await getDomElement('body > div:nth-child(5) > div');
  if (encabezadoContent) encabezadoContent.style.marginTop = '15px';

  const titulo = await getDomElement('#tituloFI');
  if (titulo) titulo.style.top = '0';

  const navMenu = await getDomElement('#subenlaces > ul');
  if (navMenu) navMenu.style.padding = '0';

  const nombre = await getDomElement('body > div:nth-child(5) > div > div.col-sm-4.detalleUsuario.text-right');
  if (nombre) nombre.style.width = '50%';
}

hideElements();
transformElements();
