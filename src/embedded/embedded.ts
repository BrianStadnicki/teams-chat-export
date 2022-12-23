function createTeamsListCheckboxes() {

    let createTeamsListCheckbox = () => {
        let input = document.createElement("input");
        input.type = "checkbox";
        input.classList.add("--embedded-chat-export-selector-channel");
        return input;
    }

    let channels = document.getElementsByClassName("animate-channel-item");
    for (let i = 0; i < channels.length; i++) {
        if(channels.item(i).children.length === 1) {
            channels.item(i).insertAdjacentElement("afterbegin", createTeamsListCheckbox());
        }
    }

    document.querySelectorAll(".team").forEach(team => {
        let observer = new MutationObserver((mutations, observer) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(node => {
                        if ((<HTMLElement>node).tagName === "DIV" &&
                            (<HTMLElement>node).classList.item(0) === "channels") {
                            (<HTMLElement>node).querySelectorAll("ul > ng-include > *").forEach(channel => {
                                channel.insertAdjacentElement("afterbegin", createTeamsListCheckbox());
                            })
                        }
                    })
                }
            })
        });
        observer.observe(team, {childList: true});
    });
}

setInterval(() => {
    if (document.getElementById("--embedded-chat-export-headbar-export-btn")) return;

    let headers = document.getElementsByClassName("powerbar-profile");
    if (headers.length !== 1) return;

    // add export button
    headers.item(0).insertAdjacentHTML("afterbegin", `
        <div id="--embedded-chat-export-headbar-export-btn" class="ts-sym me-profile me-profile-flex">
            Export
        </div>
    `);

    document.getElementById("--embedded-chat-export-headbar-export-btn").onclick = () => {
        createTeamsListCheckboxes();
    };
}, 50);
