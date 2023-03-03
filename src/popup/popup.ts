import ExtPay from "extpay";

document.getElementById("export-btn").onclick = async () => {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    if (tab) {
        await chrome.tabs.sendMessage(tab.id, {type: "begin-export"});
    } else {
        prompt("Open Microsoft Teams!");
    }
};

document.getElementById("manage-subscription").onclick = async () => {
    const extPay = ExtPay("teams-chat-export");
    let user = await extPay.getUser();
    if (user.paid) {
        extPay.openPaymentPage();
    } else if (user.subscriptionStatus === "past_due") {
        extPay.openPaymentPage();
    } else if (user.trialStartedAt && (new Date().valueOf() - user.trialStartedAt.valueOf()) > 1000*60*60*24*3) {
        extPay.openPaymentPage();
    } else if (!user.trialStartedAt) {
        extPay.openTrialPage("3-days");
    }
};
