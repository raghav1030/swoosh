chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === "SYNC_WALLET") {
        const { encryptedMnemonic, selectedNetworks } = message;

        chrome.storage.local.set({
            encryptedMnemonic,
            selectedNetworks,
            hasWallet: true
        }, () => {
            chrome.windows.create({
                url: chrome.runtime.getURL("index.html"),
                type: "popup",
                width: 415,
                height: 640,
                focused: true
            });

            sendResponse({ success: true });
        });

        return true;
    }
});