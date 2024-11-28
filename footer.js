function waitForElements() {
    return new Promise((resolve, reject) => {
        const checkElements = () => {
            const space = document.querySelector('body > div:nth-child(159)');
            const footer = document.querySelector('footer');

            if (!!space && !!footer) {
                resolve({ space, footer });
            } else {
                setTimeout(checkElements, 100);
            }
        };

        checkElements();

        // Límite de tiempo
        setTimeout(() => {
            reject(new Error('No se pudieron encontrar los elementos'));
        }, 1000 * 30);
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
