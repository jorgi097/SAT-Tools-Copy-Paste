function getDomElement(query) {
    return new Promise((resolve, reject) => {
        const checkElementExist = () => {
            const element = document.querySelector(query);
            if (element) {
                resolve(element);
            } else {
                setTimeout(checkElementExist, 500);
            }
        };
        checkElementExist();

        setTimeout(() => {
            const element = document.querySelector(query);
            if (!element) {
                reject(new Error('No se pudieron encontrar los elementos'));
            }
        }, 1000 * 60);
    });
}

const uselessQueries = {
    footer: '.main-footer',
    space: 'body > div:nth-child(162)',
    privacidad: 'body > div:nth-child(10) > div:nth-child(6)',
};

async function hideElements() {
    const removeUseles = await Promise.all(
        Object.values(uselessQueries).map(getDomElement)
    );
    removeUseles.forEach(elem => (elem.style.display = 'none'));
}

hideElements();

setTimeout(() => {
    console.log('reloaded');
    location.reload();
}, (Math.floor(Math.random() * (12 - 9 + 1)) + 9) * 1000 * 60);
