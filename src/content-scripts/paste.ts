function executeCode(): void {
  // Enable right-click
  document.oncontextmenu = () => true;

  // Enable mouse right button
  document.addEventListener('mousedown', (e: MouseEvent) => {
    if (e.button === 2 || e.button === 0) {
      return true;
    }
  });

  // Delete onpaste event listener from every input
  function deleteOnPaste(): void {
    document.querySelectorAll('[onpaste]').forEach((element) => {
      element.removeAttribute('onpaste');
    });
  }
  deleteOnPaste();

  // Just in case some elements are created on runtime
  setInterval(deleteOnPaste, 5000);

  // Removes the reverse listener that prevents CTRL + V from executing normally
  const enableCtrl_V = document.createElement('script');
  enableCtrl_V.innerHTML = `function preventDefaultEvent(event) {  }`;
  document.body.appendChild(enableCtrl_V);
}

if (document.readyState === 'complete') {
  executeCode();
} else {
  window.addEventListener('load', executeCode);
}
