// Main function to execute the code
function executeCode() {

    // Enable right-click
    document.oncontextmenu = function () {
        return true;
    };

    // Enable right mouse button
    document.addEventListener("mousedown", function (e) {
        if (e.button === 2 || e.button === 0) {
            return true;
        }
    });

    // Function to allow copy and paste
    function allowCopyAndPaste(e) {
        e.stopImmediatePropagation();
        return true;
    }

    //Delete onpaste event listener
    document.querySelectorAll("[onpaste]").forEach(function (element) {
        element.removeAttribute("onpaste");
    });

    // Events for copy and paste
    document.addEventListener("copy", allowCopyAndPaste, true);
    document.addEventListener("paste", allowCopyAndPaste, true);

    // Enable Ctrl+V
    document.addEventListener("keydown", function (e) {
        allowCopyAndPaste(e);
    });
}

setInterval(executeCode, 10000);
