document.getElementById("export-btn").onclick = async () => {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    if (tab) {
        await chrome.tabs.sendMessage(tab.id, {type: "begin-export"});
    } else {
        prompt("Open Microsoft Teams!");
    }
};
