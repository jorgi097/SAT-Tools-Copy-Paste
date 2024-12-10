function getDomElement(querySelector) {
    return new Promise((resolve, reject) => {
        const chekElementExist = () => {
            const element = document.querySelector(querySelector);
            if (!!element) {
                resolve(element);
            } else {
                setTimeout(chekElementExist, 500);
            }
        };
        chekElementExist();

        setTimeout(() => {
            reject(new Error('No se pudieron encontrar los elementos'));
        }, 1000 * 60);
    });
}

const useless = { space: 'body > div:nth-child(159)', footer: 'footer' };

async function hideElements() {
    const space = await getDomElement(useless.space);
    const footer = await getDomElement(useless.footer);
    space.style.display = 'none';
    footer.style.display = 'none';
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
