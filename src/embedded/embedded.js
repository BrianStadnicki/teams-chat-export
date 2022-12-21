setInterval(function () {
    if (document.getElementById("--embedded-chat-export-menu-export"))
        return;
    var menus = document.getElementsByClassName("app-default-menu-ul");
    if (menus.length !== 1)
        return;
    menus.item(0).insertAdjacentHTML("beforeend", "\n        <div id=\"--embedded-chat-export-menu-export\">\n            <li role=\"presentation\" tabindex=\"0\" class=\"more-options-item show-top-divider\">\n                <a role=\"menuitem\" aria-haspopup=\"false\" aria-expanded=\"false\" class=\"ts-sym has-icon\" tabindex=\"-1\">\n                    <ng-include class=\"icon\" ng-if=\"menuItem.svgPath\" src=\"menuItem.svgPath\">\n                        <svg viewBox=\"0 0 28 28\" role=\"presentation\" class=\"app-svg icons-msft-sharepoint icons-msft-office-no-padding\" focusable=\"false\">\n                        \n                        </svg>\n                    </ng-include>\n                    <span class=\"ts-popover-label\">Export</span>\n                </a>\n            </li>\n        </div>\n    ");
    document.getElementById("--embedded-chat-export-menu-export").onclick = function () {
        document.getElementById("--embedded-chat-export-modal").style.display = "block";
    };
}, 50);
function init() {
    document.head.insertAdjacentHTML("beforebegin", "\n        <div id=\"--embedded-chat-export-modal\">\n          <div id=\"--embedded-chat-export-modal-content\">\n            <span id=\"--embedded-chat-export-modal-close\">&times;</span>\n            <div id=\"--embedded-chat-export-layout\">\n                <div id=\"--embedded-chat-export-options\">\n                    <form id=\"--embedded-chat-export-options-form\">\n                        <p>Export as</p>\n                        <input type=\"radio\" class=\"--embedded-chat-export-options-output-format\" name=\"output-format\" id=\"--embedded-chat-export-output-format-text\" value=\"text\">\n                        <label for=\"--embedded-chat-export-output-format-text\">Text</label>\n                        <br>\n                        <input type=\"radio\" class=\"--embedded-chat-export-options-output-format\" name=\"output-format\" id=\"--embedded-chat-export-output-format-csv\" value=\"csv\">\n                        <label for=\"--embedded-chat-export-output-format-text\">CSV</label>\n                        <br>\n                        <input type=\"radio\" class=\"--embedded-chat-export-options-output-format\" name=\"output-format\" id=\"--embedded-chat-export-output-format-excel\" value=\"excel\">\n                        <label for=\"--embedded-chat-export-output-format-text\">Excel</label>\n                        <br>\n                        <input type=\"radio\" class=\"--embedded-chat-export-options-output-format\" name=\"output-format\" id=\"--embedded-chat-export-output-format-image\" value=\"image\">\n                        <label for=\"--embedded-chat-export-output-format-text\">Image</label>\n                        <br>\n                        <input type=\"radio\" class=\"--embedded-chat-export-options-output-format\" name=\"output-format\" id=\"--embedded-chat-export-output-format-html\" value=\"html\">\n                        <label for=\"--embedded-chat-export-output-format-text\">HTML</label>\n                        <br>\n                        <input type=\"radio\" class=\"--embedded-chat-export-options-output-format\" name=\"output-format\" id=\"--embedded-chat-export-output-format-pdf\" value=\"pdf\">\n                        <label for=\"--embedded-chat-export-output-format-text\">PDF</label>\n                        <br>\n                    </form> \n                </div>\n                <div id=\"--embedded-chat-export-preview\">\n\n                </div>\n            </div>\n          </div>\n        </div>\n    ");
    var modal = document.getElementById("--embedded-chat-export-modal");
    document.getElementById("--embedded-chat-export-modal-close").onclick = function () {
        modal.style.display = "none";
    };
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
    var form = document.getElementById("--embedded-chat-export-options-form");
    var formElements = form.elements;
    for (var i = 0; i < formElements.length; i++) {
        formElements.item(i).addEventListener("input", function () {
            render(new FormData(form));
        });
    }
}
function getMessages(threadId) {
    indexedDB.databases().then(function (databases) {
        var database = databases.filter(function (database) { return database.name.indexOf("replychain-manager") !== -1; }).pop();
        var openRequest = indexedDB.open(database.name, 1);
        openRequest.onsuccess = function () {
            var database = openRequest.result;
            var transaction = database.transaction(["replychains"], "readonly");
            var store = transaction.objectStore("replychains");
            var dataRequest = store.getAll(threadId);
            dataRequest.onsuccess = function () {
                console.log(dataRequest.result);
            };
        };
    });
}
function render(options) {
    var threadId = new URLSearchParams(window.location.search).get("threadId");
    getMessages(threadId);
    var res;
    switch (options.get("output-format")) {
        case "text":
            res = "text";
            break;
        default:
            break;
    }
    document.getElementById("--embedded-chat-export-preview").innerHTML = res;
}
init();
