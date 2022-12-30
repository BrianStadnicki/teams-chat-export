import {Sidebar} from "./Sidebar";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request["type"] === "begin-export") {
        createSidebar();
    }
});

function createSidebar() {
    let sidebar = new Sidebar();
    sidebar.init();
}
