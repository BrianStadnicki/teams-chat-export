setInterval(() => {
    if (document.getElementById("--embedded-chat-export-menu-export")) return;

    let menus = document.getElementsByClassName("app-default-menu-ul");
    if (menus.length !== 1) return;

    menus.item(0).insertAdjacentHTML("beforeend", `
        <div id="--embedded-chat-export-menu-export">
            <li role="presentation" tabindex="0" class="more-options-item show-top-divider">
                <a role="menuitem" aria-haspopup="false" aria-expanded="false" class="ts-sym has-icon" tabindex="-1">
                    <ng-include class="icon" ng-if="menuItem.svgPath" src="menuItem.svgPath">
                        <svg viewBox="0 0 28 28" role="presentation" class="app-svg icons-msft-sharepoint icons-msft-office-no-padding" focusable="false">
                        
                        </svg>
                    </ng-include>
                    <span class="ts-popover-label">Export</span>
                </a>
            </li>
        </div>
    `);

    document.getElementById("--embedded-chat-export-menu-export").onclick = () => {
        document.getElementById("--embedded-chat-export-modal").style.display = "block";
    };
}, 50);

function init() {
    document.head.insertAdjacentHTML("beforebegin", `
        <div id="--embedded-chat-export-modal">
          <div id="--embedded-chat-export-modal-content">
            <span id="--embedded-chat-export-modal-close">&times;</span>
            <div id="--embedded-chat-export-layout">
                <div id="--embedded-chat-export-options">
                    <form id="--embedded-chat-export-options-form">
                        <p>Export as</p>
                        <input type="radio" class="--embedded-chat-export-options-output-format" name="output-format" id="--embedded-chat-export-output-format-text" value="text">
                        <label for="--embedded-chat-export-output-format-text">Text</label>
                        <br>
                        <input type="radio" class="--embedded-chat-export-options-output-format" name="output-format" id="--embedded-chat-export-output-format-csv" value="csv">
                        <label for="--embedded-chat-export-output-format-csv">CSV</label>
                        <br>
                        <input type="radio" class="--embedded-chat-export-options-output-format" name="output-format" id="--embedded-chat-export-output-format-excel" value="excel">
                        <label for="--embedded-chat-export-output-format-excel">Excel</label>
                        <br>
                        <input type="radio" class="--embedded-chat-export-options-output-format" name="output-format" id="--embedded-chat-export-output-format-image" value="image">
                        <label for="--embedded-chat-export-output-format-image">Image</label>
                        <br>
                        <input type="radio" class="--embedded-chat-export-options-output-format" name="output-format" id="--embedded-chat-export-output-format-html" value="html">
                        <label for="--embedded-chat-export-output-format-html">HTML</label>
                        <br>
                        <input type="radio" class="--embedded-chat-export-options-output-format" name="output-format" id="--embedded-chat-export-output-format-pdf" value="pdf">
                        <label for="--embedded-chat-export-output-format-pdf">PDF</label>
                        <br>
                    </form> 
                </div>
                <div id="--embedded-chat-export-preview">

                </div>
            </div>
          </div>
        </div>
    `);

    let modal = document.getElementById("--embedded-chat-export-modal");

    document.getElementById("--embedded-chat-export-modal-close").onclick = () => {
        modal.style.display = "none";
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    let form = (<HTMLFormElement>document.getElementById("--embedded-chat-export-options-form"));
    let formElements = form.elements;
    for (let i = 0; i < formElements.length; i++) {
        formElements.item(i).addEventListener("input", () => {
            render(new FormData(form));
        })
    }
}

function getMessages(threadId: string) {
    indexedDB.databases().then(databases => {
        let database = databases.filter(database => database.name.indexOf("replychain-manager") !== -1).pop();
        let openRequest = indexedDB.open(database.name, 1);
        openRequest.onsuccess = () => {
            let database = openRequest.result;
            let transaction = database.transaction(["replychains"], "readonly");
            let store = transaction.objectStore("replychains");
            let dataRequest = store.getAll(threadId);
            dataRequest.onsuccess = () => {
                console.log(dataRequest.result);
            }
        };
    })
}

function render(options: FormData) {
    let threadId = new URLSearchParams(window.location.search).get("threadId");
    getMessages(threadId);

    let res: string;
    switch (<string>options.get("output-format")) {
        case "text":
            res = "text";
            break;
        default:

            break;
    }

    document.getElementById("--embedded-chat-export-preview").innerHTML = res;
}

init();
