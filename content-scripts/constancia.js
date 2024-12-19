window.onload = () => {
    const constanciaInterval = setInterval(() => {
        try {
            const constanciaWrapper =
                document.querySelector('#content > div.pwm');
            const constanciaIframe = document.querySelector('#iframetoload');
            if (constanciaWrapper && constanciaIframe) {
                constanciaWrapper.style.maxWidth = '1300px';
                constanciaIframe.style.width = '100%';
                clearInterval(constanciaInterval);
            }
        } catch (error) {}
    }, 500);
};
