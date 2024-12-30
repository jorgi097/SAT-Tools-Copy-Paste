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

const backupButton = document.getElementById('backup-btn');
const restoreButton = document.getElementById('restore-btn');


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
