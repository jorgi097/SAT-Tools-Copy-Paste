function reloadSite() {
    console.log("reloaded");
    location.reload();

}
setTimeout(
    reloadSite,
    (Math.floor(Math.random() * (12 - 9 + 1)) + 9) * 1000 * 60
);

