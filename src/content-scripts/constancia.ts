let constanciaWrapper: HTMLElement | null = null;
let constanciaIframe: HTMLElement | null = null;

const constanciaInterval = setInterval(() => {
  try {
    constanciaWrapper = document.querySelector<HTMLElement>('#content > div.pwm');
    constanciaIframe = document.querySelector<HTMLElement>('#iframetoload');
    if (constanciaWrapper && constanciaIframe) {
      clearInterval(constanciaInterval);
      constanciaWrapper.style.maxWidth = '1300px';
      constanciaIframe.style.width = '100%';
    }
  } catch (error) {
    // Ignorar errores en selección
  }
}, 500);
