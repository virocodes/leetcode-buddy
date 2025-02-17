const onbutton = document.getElementById("turnon");
onbutton.addEventListener("click", () => {
    chrome.storage.local.get(['isEnabled'], (result) => {
        const newState = !result.isEnabled;
        chrome.storage.local.set({ isEnabled: newState }, () => {
            onbutton.textContent = newState ? "Turn Off" : "Turn On";
        });
        // Send message to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "toggleExtension", isEnabled: newState});
        });
    });
});

// Initialize button state when popup opens
chrome.storage.local.get(['isEnabled'], (result) => {
    onbutton.textContent = result.isEnabled ? "Turn Off" : "Turn On";
});