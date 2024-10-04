chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.enabled) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0].id;

            chrome.scripting.executeScript({
                target: { tabId },
                files: ["content-script.js"],
                world: "MAIN",
            });
        });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});
