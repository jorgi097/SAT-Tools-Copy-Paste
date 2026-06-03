setTimeout(
  () => {
    console.log('reloaded');
    location.reload();
  },
  (Math.floor(Math.random() * (12 - 9 + 1)) + 9) * 1000 * 60,
);