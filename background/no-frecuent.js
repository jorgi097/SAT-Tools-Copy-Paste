const noFrecuenteInterval = setInterval(() => {
    if (!!clienteFrecuenteElement) {
        clienteFrecuenteElement.addEventListener('blur', noFrecuente);
        clearInterval(noFrecuenteInterval);
    }
}, 1000 * 10);

function noFrecuente() {
    
}
