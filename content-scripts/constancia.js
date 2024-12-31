let constanciaWrapper;
let constanciaIframe;

const constanciaInterval = setInterval(() => {
    try {
        constanciaWrapper = document.querySelector('#content > div.pwm');
        constanciaIframe = document.querySelector('#iframetoload');
        if (constanciaWrapper && constanciaIframe) {
            clearInterval(constanciaInterval);
            constanciaWrapper.style.maxWidth = '1300px';
            constanciaIframe.style.width = '100%';
        }
    } catch (error) {}
}, 500);
