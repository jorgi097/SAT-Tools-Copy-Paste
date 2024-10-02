// Main function to execute the code
(function executeCode() {
    // Enable right-click
    document.oncontextmenu = () => true;

    // Enable mouse right button
    document.addEventListener("mousedown", (e) => {
        if (e.button === 2 || e.button === 0) {
            return true;
        }
    });

    // Delete onpaste event listener from every input
    function deleteOnPaste() {
        document.querySelectorAll("[onpaste]").forEach((element) => {
            element.removeAttribute("onpaste");
        });
    }
    deleteOnPaste();

    // Just in case some elements are created on runtime
    setInterval(deleteOnPaste, 10000);

    // Removes the reverse listener that prevents CTRL + V from executing normally
    let enableCtrl_V = document.createElement("script");
    enableCtrl_V.innerHTML = `function preventDefaultEvent(event) {  }`;
    document.body.appendChild(enableCtrl_V);
})();
