let cliente = document.querySelector("#\\31 35textboxautocomplete55");
let cp = document.querySelector("#\\31 35textbox61");
let optionsUl = document.querySelector("#ui-id-2");
let optionsLi = optionsHtml.querySelectorAll("li");
let RFCs = Array.from(optionsLi).map((li) => li.textContent);
let exclude = ["XAXX010101000", "XEXX010101000", "Otro"];

cliente.addEventListener("blur", (e) => {
    let currentValue = e.target.value;

    if (
        (currentValue.length === 12 || 13) &&
        !exclude.includes(currentValue) &&
        currentValue != ""
    ) {
        console.log("Opcion valida " + currentValue);
        cp.value = "45070";
    }
});

if (currentValue === "Otro" && !cliente.classList.contains("alert")) {
    console.log("Save some value");
}
