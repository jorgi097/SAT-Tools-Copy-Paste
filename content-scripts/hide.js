const hideQueries = {
  footer: '.main-footer',
  space: 'body > div:nth-child(162)',
  privacidad: 'body > div:nth-child(10) > div:nth-child(6)',
  primerNavBar: 'body > nav',
  primerHeader: 'body > header',
};

async function hideElements() {
  const removeUseless = await Promise.all(
    Object.values(hideQueries).map(getDomElement),
  );
  removeUseless.forEach(elem => (elem.style.display = 'none'));
}

async function transformElements() {
  const segundoNavBar = await getDomElement(
    'body > div.navbar.navbar-inverse.sub-navbar.navbar-fixed-top',
  );
  segundoNavBar.style.marginTop = 0;

  const encabezadoWrapper = await getDomElement(
    'body > div.container.margin-menu-encabezado',
  );
  encabezadoWrapper.classList.remove('margin-menu-encabezado');

  const encabezadoContent = await getDomElement(
    'body > div:nth-child(5) > div',
  );
  encabezadoContent.style.marginTop = '15px';

  const titulo = await getDomElement('#tituloFI');
  titulo.style.top = 0;

  const navMenu = await getDomElement('#subenlaces > ul');
  navMenu.style.padding = 0;
}

hideElements();
transformElements();