let enabledButton = document.querySelector("#enabledButton");
let enabled = true;
enabledButton.innerHTML = enabled ? "Habilitado" : "Deshabilitado";

enabledButton.classList.toggle("enabledButton", enabled);
enabledButton.classList.toggle("disabledButton", !enabled);

enabledButton.addEventListener("click", (e) => {
    enabled = !enabled;
    e.target.innerHTML = enabled ? "Habilitado" : "Deshabilitado";
    enabledButton.classList.add(enabled ? "enabledButton" : "disabledButton");
    enabledButton.classList.remove(
        !enabled ? "enabledButton" : "disabledButton"
    );
    getCurrentTab();
});

document
    .querySelector(".popup-message button")
    .addEventListener("click", function () {
        window.open("https://portal.facturaelectronica.sat.gob.mx", "_blank");
    });

// async function getCurrentTab() {
//     let queryOptions = { active: true, lastFocusedWindow: true };
//     let [tab] = await chrome.tabs.query(queryOptions);
//     console.log(tab.index);
//     let message = { salute: "hello" };
//     await chrome.tabs.sendMessage(tab.id, message);
// }

