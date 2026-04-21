const backupButton = document.getElementById('backup-btn');
const restoreButton = document.getElementById('restore-btn');
const restoreInput = document.getElementById('restore-input');

const saveData = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const restoreData = data => {
  chrome.storage.local.get(null, existingData => {
    const mergedData = { ...existingData };

    Object.keys(data).forEach(key => {
      if (!mergedData[key]) {
        mergedData[key] = data[key];
      } else if (Array.isArray(mergedData[key]) && Array.isArray(data[key])) {
        data[key].forEach(incomingClient => {
          // Buscamos si el cliente (por su RFC) ya existe en la lista local
          const index = mergedData[key].findIndex(
            c => c.rfc === incomingClient.rfc
          );
          
          if (index !== -1) {
            // Si existe, lo actualizamos con los datos del respaldo
            mergedData[key][index] = incomingClient;
          } else {
            // Si no existe, lo agregamos
            mergedData[key].push(incomingClient);
          }
        });
      }
    });

    chrome.storage.local.set(mergedData, () => {
      alert('Datos restaurados y combinados correctamente.');
    });
  });
};

const validateFile = data => {
  if (typeof data !== 'object') {
    throw new Error('El archivo debe ser un objeto JSON.');
  }

  if (Object.keys(data).length === 0) {
    throw new Error('El archivo no debe estar vacío.');
  }

  // Verify the structure of the JSON data
  Object.keys(data).forEach(key => {
    if (key === 'enabled') {
      delete data[key];
      return;
    }

    if (!Array.isArray(data[key])) {
      throw new Error(`El valor de la clave ${key} debe ser un array.`);
    }

    data[key].forEach((client, index) => {
      if (typeof client.cp !== 'string') {
          throw new Error(
            `El campo "cp" del cliente en la posición ${index} en la clave ${key} es inválido.`,
          );
        }
        if (typeof client.razonSocial !== 'string') {
          throw new Error(
            `El campo "razonSocial" del cliente en la posición ${index} en la clave ${key} es inválido.`,
          );
        }
        if (typeof client.regimenFiscal !== 'string') {
          throw new Error(
            `El campo "regimenFiscal" del cliente en la posición ${index} en la clave ${key} es inválido.`,
          );
        }
        if (typeof client.rfc !== 'string') {
          throw new Error(
            `El campo "rfc" del cliente en la posición ${index} en la clave ${key} es inválido.`,
          );
        }
      });
  });
};

backupButton.addEventListener('click', () => {
  chrome.storage.local.get(null, data => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    if (Object.keys(data).length === 0) {
      console.error('No hay datos para respaldar.');
      return;
    }
    const fileName = `HerramientasSatBackup-${new Date()
      .toISOString()
      .replace(/[-:tT]*/g, '')}.json`;

    // Remover la propiedad 'enabled' para que no quede en el JSON
    delete data.enabled;

    if (Object.keys(data).length === 0) {
      console.error('No hay datos válidos para respaldar.');
      // alert('No hay datos de clientes guardados.');
      return;
    }

    saveData(data, fileName);
  });
});

restoreButton.addEventListener('click', e => {
  restoreInput.click();
});

restoreInput.addEventListener('change', e => {
  const file = e.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const config = JSON.parse(e.target.result);
        validateFile(config);
        restoreData(config);
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };

    reader.readAsText(file);
  }
});
