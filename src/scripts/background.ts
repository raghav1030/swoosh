chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === "SYNC_WALLET") {
        const { mnemonic, password } = message;

        chrome.storage.local.set({
            mnemonic,
            password,
            hasWallet: true
        }, () => {
            console.log("Wallet synced from localhost!");
            sendResponse({ success: true });
        });

        return true; // Keeps the messaging channel open for the async response
    }
});