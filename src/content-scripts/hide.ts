import { getDomElement } from '../utils/dom';

const hideQueries: Record<string, string> = {
  footer: '.main-footer',
  space: 'body > div:nth-child(162)',
  privacidad: 'body > div:nth-child(10) > div:nth-child(6)',
  primerNavBar: 'body > nav',
  primerHeader: 'body > header',
  headerNav: 'body > header > nav',
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

async function adjustLayoutForNavbar(): Promise<void> {
  // El navbar principal se encuentra fijo, por lo que se debe eliminar el margen superior del body y del encabezado
  const mainNavbarElement = await getDomElement('body > div.navbar.navbar-inverse.sub-navbar.navbar-fixed-top');
  if (mainNavbarElement) mainNavbarElement.style.marginTop = '0';

  // Es el contenedor con el RFC y el nombre del usuario, se debe eliminar la clase que le da margen superior al encabezado
  const userInfoWrapper = await getDomElement('body > div.container.margin-menu-encabezado');
  if (userInfoWrapper) userInfoWrapper.classList.remove('margin-menu-encabezado');

  // Se debe eliminar el margen superior del contenedor que tiene el nombre del usuario y el RFC, para que quede pegado al encabezado
  const userInfoContent = await getDomElement('body > div:nth-child(5) > div');
  if (userInfoContent) userInfoContent.style.marginTop = '15px';

  // Se debe eliminar el margen superior del contenedor que tiene el nombre del usuario y el RFC, para que quede pegado al encabezado
  const mainNavbarTitle = await getDomElement('#tituloFI');
  if (mainNavbarTitle) mainNavbarTitle.style.top = '0';

  // Se debe eliminar el padding del contenedor que tiene los enlaces del navbar principal, para que quede pegado al encabezado
  const mainNavbarMenu = await getDomElement('#subenlaces > ul');
  if (mainNavbarMenu) mainNavbarMenu.style.padding = '0';

  // Se aumenta de 33.33 % a 50% el ancho del contenedor que tiene el nombre del usuario y el RFC, para que quepa más información en una sola línea y no se rompa el diseño de la página
  const nombre = await getDomElement('body > div:nth-child(5) > div > div.col-sm-4.detalleUsuario.text-right');
  if (nombre) nombre.style.width = '50%';
}

hideElements().then(() => adjustLayoutForNavbar());
