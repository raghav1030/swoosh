console.log("Swoosh Wallet Background Service Started");

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});