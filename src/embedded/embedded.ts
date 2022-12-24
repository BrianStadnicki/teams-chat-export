function insertChannelCheckbox(channel: HTMLDivElement) {
    let input = document.createElement("input");
    input.type = "checkbox";
    input.classList.add("--embedded-chat-export-selector-channel");
    channel.insertAdjacentElement("afterbegin", input);
}

function createTeamsListCheckboxes() {

    let channels = document.getElementsByClassName("animate-channel-item");
    for (let i = 0; i < channels.length; i++) {
        if(channels.item(i).children.length === 1) {
            insertChannelCheckbox(<HTMLDivElement>channels.item(i));
        }
    }

    document.querySelectorAll(".team").forEach(team => {
        new MutationObserver((mutations, observer) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(node => {
                        if ((<HTMLElement>node).tagName === "DIV" &&
                            (<HTMLElement>node).classList.item(0) === "channels") {
                            (<HTMLElement>node).querySelectorAll("ul > ng-include > *").forEach(channel => {
                                insertChannelCheckbox(<HTMLDivElement>channel);
                            })
                        }
                    })
                }
            })
        }).observe(team, {childList: true});
    });
}

function insertPostCheckbox(postDiv: HTMLDivElement) {
    if (postDiv.querySelector(".--embedded-chat-export-selector-post") !== null) {
        return;
    }

    let insertPosition = postDiv.querySelector(".clearfix > thread > .ts-message > .conversation-common > thread-body > .thread-body > .media-left");
    if (insertPosition === null) {
        return;
    }

    let input = document.createElement("input");
    input.type = "checkbox";
    input.classList.add("--embedded-chat-export-selector-post");
    insertPosition.insertAdjacentElement("beforeend", input);
}

function createPostsListCheckboxes() {
    let posts = document.getElementsByClassName("ts-message-list-item");
    for (let i = 0; i < posts.length; i++) {
        insertPostCheckbox(<HTMLDivElement>posts.item(i));
    }

    new MutationObserver((mutations, observer) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach(node => {
                    if ((<HTMLElement>node).tagName === "DIV" &&
                        (<HTMLElement>node).classList.contains("ts-message-list-item")) {

                        insertPostCheckbox(<HTMLDivElement>node);
                    }
                })
            }
        })
    }).observe(document.getElementsByClassName("ts-message-list-container").item(0), {childList: true});
}

function insertCommentCheckbox(commentDiv: HTMLDivElement) {
    if (commentDiv.querySelector(".--embedded-chat-export-selector-comment") !== null) {
        return;
    }

    let insertPosition = commentDiv.querySelector("thread-body > .thread-body > .media-left");
    if (insertPosition === null) {
        return;
    }

    let input = document.createElement("input");
    input.type = "checkbox";
    input.classList.add("--embedded-chat-export-selector-comment");
    insertPosition.insertAdjacentElement("beforeend", input);
}

function createCommentsCheckboxes() {
    document.querySelectorAll(".conversation-reply").forEach(node => {
        insertCommentCheckbox(<HTMLDivElement>node);
    });

    new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach(node => {
                    if ((<HTMLElement>node).tagName === "DIV" &&
                        (<HTMLElement>node).classList.contains("conversation-reply")) {

                        insertCommentCheckbox(<HTMLDivElement>node);
                    }
                })
            }
        })
    }).observe(document.getElementsByClassName("ts-message-list-container").item(0), {childList: true, subtree: true});

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
        createPostsListCheckboxes();
        createCommentsCheckboxes();
    };
}, 50);
