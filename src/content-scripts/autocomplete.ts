interface FavoriteReceptor {
  RFCReceptor: string;
  CodigoPostal: string;
  RegimenFiscalDescripcion: string;
  [key: string]: unknown;
}

interface FavoritesData {
  Favoritos: {
    Receptores: FavoriteReceptor[];
  };
}

const frequentElementQueries = {
  client: '#\\31 35textboxautocomplete55',
  razonSocial: '#\\31 35textbox60',
  cp: '#\\31 35textbox61',
  regimenFiscal: '#\\31 35textboxautocomplete62',
};

const frequentElements: Record<string, HTMLInputElement | null> = {};
const favorites: FavoriteReceptor[] = [];
const excluirClient: string[] = ['XAXX010101000', 'XEXX010101000', 'Otro'];

function interceptFavorites(): void {
  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, ...args: Parameters<typeof originalSend>) {
    this.addEventListener('load', function (this: XMLHttpRequest) {
      if (this.responseText.includes('Historicos')) {
        try {
          const favoritesData: FavoritesData = JSON.parse(JSON.parse(this.responseText));
          if (favoritesData?.Favoritos?.Receptores) {
            favorites.push(...favoritesData.Favoritos.Receptores);
          }
        } catch (e) {
          console.error('Error parseando favoritos:', e);
        }
      }
    });
    originalSend.apply(this, args);
  };
}

interceptFavorites();

function frequentAutocomplete(): void {
  const client = frequentElements.client;
  if (!client) return;

  client.addEventListener('blur', (e: Event) => {
    const target = e.target as HTMLInputElement;
    const currentValue = target.value;
    const cp = frequentElements.cp;
    const regimenFiscal = frequentElements.regimenFiscal;
    const regimenRegex = /[^-0-9]+$/;

    if (currentValue !== '' && !excluirClient.includes(currentValue)) {
      const matchedFavorite = favorites.find(
        favorite => favorite.RFCReceptor === currentValue
      );

      if (matchedFavorite) {
        console.log(matchedFavorite);
        if (cp && matchedFavorite.CodigoPostal !== '') {
          cp.value = matchedFavorite.CodigoPostal;
          cp.dispatchEvent(new Event('blur'));
        }

        if (regimenFiscal && matchedFavorite.RegimenFiscalDescripcion !== '') {
          const matchResult = matchedFavorite.RegimenFiscalDescripcion.match(regimenRegex);
          if (matchResult) {
            const cleanRegimen = matchResult[0].trim();
            regimenFiscal.value = cleanRegimen;
            regimenFiscal.dispatchEvent(new Event('focus'));
            setTimeout(() => {
              const dropdownItem = document.querySelector('#ui-id-3 > li');
              if (dropdownItem) {
                dropdownItem.dispatchEvent(new Event('click', { bubbles: true }));
              }
              (document.activeElement as HTMLElement | null)?.blur();
            }, 700);
          }
        }
      }
    } else {
      if (cp) {
        cp.value = '';
        cp.dispatchEvent(new Event('blur'));
      }
      if (regimenFiscal) {
        regimenFiscal.value = '';
        regimenFiscal.dispatchEvent(new Event('blur'));
      }
    }
  });
}

const checkElementExists = setInterval(() => {
  Object.entries(frequentElementQueries).forEach(([key, query]) => {
    if (!frequentElements[key]) {
      try {
        frequentElements[key] = document.querySelector<HTMLInputElement>(query);
      } catch (error) {
        // Ignorar query selector invalidos temporalmente
      }
    }
  });

  const allElementsLoaded = Object.keys(frequentElementQueries).every(
    (key) => {
      return (
        frequentElements[key] !== null &&
        frequentElements[key] !== undefined
      );
    }
  );

  if (allElementsLoaded) {
    clearInterval(checkElementExists);
    frequentAutocomplete();
  }
}, 3000);
