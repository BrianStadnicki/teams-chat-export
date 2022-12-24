import {Selection} from "./Types";

export class Renderer {
    selection: Selection;

    constructor(selection: Selection) {
        this.selection = selection;
    }

    init() {
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
                this.createTeamsListCheckboxes();
                this.createPostsListCheckboxes();
                this.createCommentsCheckboxes();
            };
        }, 50);
    }

    private insertChannelCheckbox(channel: HTMLDivElement) {
        if (channel.children.length !== 1 || channel.id === "") {
            return;
        }
        let input = document.createElement("input");
        input.type = "checkbox";
        input.classList.add("--embedded-chat-export-selector-channel");
        channel.insertAdjacentElement("afterbegin", input);

        if (!this.selection.channels.has(channel.id.replace("channel-", ""))) {
            this.selection.channels.set(channel.id.replace("channel-", ""),
                {posts: new Map()});
        }
    }

    private createTeamsListCheckboxes() {
        let channels = document.getElementsByClassName("animate-channel-item");
        for (let i = 0; i < channels.length; i++) {
            this.insertChannelCheckbox(<HTMLDivElement>channels.item(i));
        }

        document.querySelectorAll(".team").forEach(team => {
            new MutationObserver((mutations, observer) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === "childList") {
                        mutation.addedNodes.forEach(node => {
                            if ((<HTMLElement>node).tagName === "DIV" &&
                            (<HTMLElement>node).classList.item(0) === "channels") {
                                (<HTMLElement>node).querySelectorAll("ul > ng-include > *").forEach(channel => {
                                    this.insertChannelCheckbox(<HTMLDivElement>channel);
                                });
                            }
                        });
                    }
                });
            }).observe(team, {childList: true});
        });
    }

    private insertPostCheckbox(postDiv: HTMLDivElement) {
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

        if (!this.selection.channels.get(this.getActiveChannel()).posts.has(postDiv.attributes.getNamedItem("data-scroll-id").value)) {
            this.selection.channels.get(this.getActiveChannel())
                .posts.set(postDiv.attributes.getNamedItem("data-scroll-id").value, {
                    selected: false,
                    comments: new Map()
            });
        }
    }

    private createPostsListCheckboxes() {
        let posts = document.getElementsByClassName("ts-message-list-item");
        for (let i = 0; i < posts.length; i++) {
            this.insertPostCheckbox(<HTMLDivElement>posts.item(i));
        }

        document.querySelectorAll(".conversation-common.conversation-collapsed > thread-collapsed > div > .expand-collapse").forEach(expandComments => {
            (<HTMLDivElement>expandComments).click();
        })

        new MutationObserver((mutations, observer) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(node => {
                        if ((<HTMLElement>node).tagName === "DIV" &&
                            (<HTMLElement>node).classList.contains("ts-message-list-item")) {

                            this.insertPostCheckbox(<HTMLDivElement>node);

                            setTimeout(() => {
                                let collapse = (<HTMLDivElement>(<HTMLElement>node).querySelector(".conversation-common.conversation-collapsed > thread-collapsed > div > .expand-collapse"));
                                if (collapse !== null) {
                                    collapse.click();
                                }
                            }, 100);
                        }
                    });
                }
            });
        }).observe(document.getElementsByClassName("ts-message-list-container").item(0), {childList: true});
    }

    private insertCommentCheckbox(commentDiv: HTMLDivElement) {
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

        if (!this.selection.channels.get(this.getActiveChannel()).posts.get(commentDiv.parentElement.parentElement.parentElement.parentElement
            .attributes.getNamedItem("data-scroll-id").value).comments.has(commentDiv.querySelector("thread-body > .thread-body").id)) {
            this.selection.channels.get(this.getActiveChannel()).posts.get(commentDiv.parentElement.parentElement.parentElement.parentElement.attributes.getNamedItem("data-scroll-id").value).comments.set(commentDiv.querySelector("thread-body > .thread-body").id, {
                selected: false
            })
        }
    }

    private createCommentsCheckboxes() {
        document.querySelectorAll(".conversation-reply").forEach(node => {
            this.insertCommentCheckbox(<HTMLDivElement>node);
        });

        new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(node => {
                        if ((<HTMLElement>node).tagName === "DIV" &&
                            (<HTMLElement>node).classList.contains("conversation-reply")) {

                            this.insertCommentCheckbox(<HTMLDivElement>node);
                        }
                    });
                }
            });
        }).observe(document.getElementsByClassName("ts-message-list-container").item(0), {childList: true, subtree: true});
    }

    private getActiveChannel() {
        return document.querySelector(".animate-channel-item.left-rail-selected").id.replace("channel-", "");
    }
}
