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
    chrome.storage.local.set(data, () => {
        alert('Datos restaurados correctamente.');
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
        if (key !== 'enabled' && !Array.isArray(data[key])) {
            throw new Error(`El valor de la clave ${key} debe ser un array.`);
        }

        if (key !== 'enabled') {
            data[key].forEach((client, index) => {
                if (typeof client.cp !== 'string') {
                    throw new Error(
                        `El campo "cp" del cliente en la posición ${index} en la clave ${key} es inválido.`
                    );
                }
                if (typeof client.razonSocial !== 'string') {
                    throw new Error(
                        `El campo "razonSocial" del cliente en la posición ${index} en la clave ${key} es inválido.`
                    );
                }
                if (typeof client.regimenFiscal !== 'string') {
                    throw new Error(
                        `El campo "regimenFiscal" del cliente en la posición ${index} en la clave ${key} es inválido.`
                    );
                }
                if (typeof client.rfc !== 'string') {
                    throw new Error(
                        `El campo "rfc" del cliente en la posición ${index} en la clave ${key} es inválido.`
                    );
                }
                if (typeof client.usoFactura !== 'string') {
                    throw new Error(
                        `El campo "usoFactura" del cliente en la posición ${index} en la clave ${key} es inválido.`
                    );
                }
            });
        } else if (typeof data[key] !== 'boolean') {
            throw new Error(
                'El valor de la clave "enabled" debe ser un booleano.'
            );
        }
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
