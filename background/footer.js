function waitForElements() {
    return new Promise((resolve, reject) => {
        const checkElements = () => {
            const space = document.querySelector('body > div:nth-child(159)');
            const footer = document.querySelector('footer');

            if (!!space && !!footer) {
                resolve({ space, footer });
            } else {
                setTimeout(checkElements, 500);
            }
        };

        checkElements();

        // Límite de tiempo
        setTimeout(() => {
            reject(new Error('No se pudieron encontrar los elementos'));
        }, 1000 * 60);
    });
}

async function hideElements() {
    try {
        const { space, footer } = await waitForElements();
        space.style.display = 'none';
        footer.style.display = 'none';
    } catch (error) {
        console.error('Error:', error);
    }
}

hideElements();

function reloadSite() {
    console.log('reloaded');
    location.reload();
}
setTimeout(
    reloadSite,
    (Math.floor(Math.random() * (12 - 9 + 1)) + 9) * 1000 * 60
);
