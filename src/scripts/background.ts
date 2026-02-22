chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === "SYNC_WALLET") {
        const { encryptedMnemonic, selectedNetworks } = message;

        chrome.storage.local.set({
            encryptedMnemonic,
            selectedNetworks,
            hasWallet: true
        }, () => {
            sendResponse({ success: true });
        });

        return true;
    }
});