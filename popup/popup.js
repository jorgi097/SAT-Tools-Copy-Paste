let enabledButton = document.querySelector("#enabledButton");
let enabled = true;
enabledButton.innerHTML = enabled ? "Habilitado" : "Deshabilitado";

enabledButton.classList.add(enabled ? "enabledButton" : "disabledButton");
    enabledButton.classList.remove(enabled ? "disabledButton" : "enabledButton");

enabledButton.addEventListener("click", (e) => {
    enabled = !enabled;
    e.target.innerHTML = enabled ? "Habilitado" : "Deshabilitado";
    enabledButton.classList.add(enabled ? "enabledButton" : "disabledButton");
    enabledButton.classList.remove(
        !enabled ? "enabledButton" : "disabledButton"
    );
    let message = { enabled: enabled ? true : false };
    chrome.runtime.sendMessage(message);

});

document
    .querySelector(".popup-message button")
    .addEventListener("click", function () {
        window.open("https://portal.facturaelectronica.sat.gob.mx", "_blank");
    });



