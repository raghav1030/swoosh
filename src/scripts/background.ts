chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === "SYNC_WALLET") {
        const { encryptedMnemonic } = message;

        chrome.storage.local.set({
            encryptedMnemonic,
            hasWallet: true
        }, () => {
            console.log("Wallet saved to storage");

            chrome.tabs.create({
                url: chrome.runtime.getURL("index.html")
            });

            sendResponse({ success: true });
        });

        return true; 
    }
});