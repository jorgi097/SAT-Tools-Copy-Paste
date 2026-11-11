function getReloadDelay(): number {
  return (Math.floor(Math.random() * (12 - 9 + 1)) + 9) * 1000 * 60;
}

function reload(): void {
  console.log('reloaded');
  location.reload();
}

let timer = window.setTimeout(reload, getReloadDelay());

function resetTimer(): void {
  window.clearTimeout(timer);
  timer = window.setTimeout(reload, getReloadDelay());
}

if (window.top === window) {
  document.addEventListener('click', resetTimer, true);
}
