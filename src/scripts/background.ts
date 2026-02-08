// src/background.ts
console.log("Swoosh Wallet Background Service Started");

// Keep the service worker alive
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});