export class Sidebar {

    init() {
        let mainScreen = <HTMLDivElement>document.createElement("div");
        mainScreen.id = "--embedded-chat-export-main";
        mainScreen.innerHTML = `
                <form id="--embedded-chat-export-options-form" xmlns="http://www.w3.org/1999/html">
                    <div id="--embedded-chat-export-options-form-options">
                        <h4>Export</h4>
                        <input type="radio" class="--embedded-chat-export-options-form-selection" name="selection" id="--embedded-chat-export-options-form-selection-all" value="all">
                        <label for="--embedded-chat-export-options-form-selection-all">All</label>
                        <br>
                        <input type="radio" class="--embedded-chat-export-options-form-selection" name="selection" id="--embedded-chat-export-options-form-selection-date" value="date">
                        <label for="--embedded-chat-export-options-form-selection-date">In-between dates</label>
                        <br>
                        <input type="date" name="selection-date-lower">
                        <span>until</span>
                        <input type="date" name="selection-date-upper">
                        <br>
                        <input type="radio" class="--embedded-chat-export-options-form-selection" name="selection" id="--embedded-chat-export-options-form-selection-first-messages" value="first-messages">
                        <label for="--embedded-chat-export-options-form-selection-first-messages">First X messages</label>
                        <input type="number" name="selection-number-first">
                        <br>
                        <input type="radio" class="--embedded-chat-export-options-form-selection" name="selection" id="--embedded-chat-export-options-form-selection-last-messages" value="last-messages">
                        <label for="--embedded-chat-export-options-form-selection-last-messages">Last X messages</label>
                        <input type="number" name="selection-number-last">
                        <br>
                        <br>
                        
                        <h4>As</h4>
                        <input type="radio" class="--embedded-chat-export-options-form-format" name="format" id="--embedded-chat-export-options-form-format-txt" value="txt">
                        <label for="--embedded-chat-export-options-form-format-png">TXT</label>
                        <br>
                        <input type="radio" class="--embedded-chat-export-options-form-format" name="format" id="--embedded-chat-export-options-form-format-pdf" value="pdf">
                        <label for="--embedded-chat-export-options-form-format-svg">PDF</label>
                    </div>
                    
                    <div id="--embedded-chat-export-options-form-teams">
                        <h1>Teams<button id="--embedded-chat-export-options-form-teams-select-all-none">Select all</button></h1>
                    </div>
                    
                    <div id="--embedded-chat-export-options-form-banner">
                        <div class="parent">
                            <button id="--embedded-chat-export-options-form-cancel">Cancel</button>
                            <button id="--embedded-chat-export-options-form-export">Export</button>
                        </div>
                    </div>
                </form>
        `;

        let form = (<HTMLFormElement>mainScreen.querySelector("#--embedded-chat-export-options-form"));

        form.onsubmit = (ev) => {
            ev.preventDefault();
        }

        (<HTMLButtonElement>mainScreen.querySelector("#--embedded-chat-export-options-form-cancel")).onclick = (ev) => {
            ev.preventDefault();
            this.destroy();
        };

        (<HTMLButtonElement>mainScreen.querySelector("#--embedded-chat-export-options-form-export")).onclick = (ev) => {
            ev.preventDefault();

            let data = new FormData(<HTMLFormElement>mainScreen.querySelector("#--embedded-chat-export-options-form"));
            let format = data.get("format");

            console.log(data.getAll("channel"));

            if (format === null) return;
        }

        window.indexedDB.databases().then(databases => {
            let openRequest = window.indexedDB.open(databases.find(database => database.name.startsWith("Teams:conversation-manager:")).name);
            openRequest.onsuccess = (event) => {
                let db = openRequest.result;
                const objectStore = db.transaction("conversations").objectStore("conversations");
                let request = objectStore.getAll();
                request.onsuccess = (event) => {
                    let channelsMap = new Map<string, object>;
                    request.result.forEach(channel => channelsMap.set(channel["id"], channel));

                    let teamsList = document.getElementById("--embedded-chat-export-options-form-teams");

                    channelsMap.forEach((channel, id) => {
                        if (channel["threadProperties"]["topics"] !== undefined) {
                            let generalInput = document.createElement("input");
                            generalInput.classList.add("--embedded-chat-export-options-form-channel-input", "main");
                            generalInput.id = `--embedded-chat-export-options-form-channel-${id.replace("@", "")}`;
                            generalInput.name = "channel";
                            generalInput.value = id;
                            generalInput.type = "checkbox";

                            let generalLabel = document.createElement("label");
                            generalLabel.classList.add("--embedded-chat-export-options-form-channel-label", "main");
                            generalLabel.htmlFor = generalInput.id;
                            generalLabel.textContent = channel["threadProperties"]["spaceThreadTopic"];

                            teamsList.appendChild(generalInput);
                            teamsList.appendChild(generalLabel);
                            teamsList.appendChild(document.createElement("br"));

                            JSON.parse(channel["threadProperties"]["topics"]).forEach(topic => {
                                let channelInput = document.createElement("input");
                                channelInput.classList.add("--embedded-chat-export-options-form-channel-input", "sub");
                                channelInput.id = `--embedded-chat-export-options-form-channel-${topic["id"].replace("@", "")}`
                                channelInput.name = "channel";
                                channelInput.value = topic["id"];
                                channelInput.type = "checkbox";

                                let channelLabel = document.createElement("label");
                                channelLabel.classList.add("--embedded-chat-export-options-form-channel-label", "sub");
                                channelLabel.htmlFor = channelInput.id;
                                channelLabel.textContent = topic["name"];

                                teamsList.appendChild(channelInput);
                                teamsList.appendChild(channelLabel);
                                teamsList.appendChild(document.createElement("br"));
                            });

                            teamsList.appendChild(document.createElement("hr"));
                        }
                    });
                }
            };
        });

        (<HTMLButtonElement>mainScreen.querySelector("#--embedded-chat-export-options-form-teams-select-all-none")).onclick = () => {
            let btn = <HTMLButtonElement>mainScreen.querySelector("#--embedded-chat-export-options-form-teams-select-all-none");

            mainScreen.querySelectorAll(".--embedded-chat-export-options-form-channel-input").forEach((input: HTMLInputElement) => {
                if (btn.textContent === "Select all" && !input.checked) input.click();
                if (btn.textContent === "Unselect all" && input.checked) input.click();
            });

            if (btn.textContent === "Select all") {
                btn.textContent = "Unselect all"
            } else {
                btn.textContent = "Select all";
            }
        }

        let channelList = <HTMLDivElement>document.querySelector(".ts-channel-list");
        channelList.style.display = "none";
        channelList.insertAdjacentElement("beforebegin", mainScreen);

        (<HTMLDivElement>document.querySelector(".ts-left-rail-wrapper")).style.width = "50rem";

        let teamsButton = <HTMLButtonElement>document.querySelector('button[aria-label="Teams Toolbar"]');
        if (teamsButton) teamsButton.click();
    }

    destroy() {
        document.getElementById("--embedded-chat-export-main").remove();
        (<HTMLDivElement>document.querySelector(".ts-channel-list")).style.display = "initial";
        (<HTMLDivElement>document.querySelector(".ts-left-rail-wrapper")).style.width = "initial";
    }
}
