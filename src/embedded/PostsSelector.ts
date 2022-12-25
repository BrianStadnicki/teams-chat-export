import {Selection} from "./Types";

export class PostsSelector {
    selection: Selection;

    constructor(selection: Selection) {
        this.selection = selection;
        this.selection.channels.set(this.getActiveChannel(), {posts: new Map()});
        this.createPostsListCheckboxes();
        this.createCommentsCheckboxes();
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

            };
        }, 50);
    }

    private insertPostCheckbox(postDiv: HTMLDivElement) {
        if (postDiv.querySelector(".--embedded-chat-export-selector-post") !== null) {
            return;
        }

        let insertPosition = postDiv.querySelector(".clearfix > thread > .ts-message > .conversation-common > thread-body > .thread-body > .media-left");
        if (insertPosition === null) {
            return;
        }

        let id = postDiv.attributes.getNamedItem("data-scroll-id").value;

        let input = <HTMLInputElement>document.createElement("input");
        input.id = `--embedded-chat-export-selector-post-${id}`;
        input.type = "checkbox";
        input.classList.add("--embedded-chat-export-selector-post");
        input.onclick = () => {
            let post = this.selection.channels.get(this.getActiveChannel()).posts.get(id);
            post.selected = input.checked;
            for (let key of post.comments.keys()) {
                let comment = <HTMLInputElement>document.getElementById(`--embedded-chat-export-selector-comment-${key}`);
                if (comment.checked !== input.checked) {
                    comment.click();
                }
            }
        };
        insertPosition.insertAdjacentElement("beforeend", input);

        if (!this.selection.channels.get(this.getActiveChannel()).posts.has(id)) {
            this.selection.channels.get(this.getActiveChannel())
                .posts.set(id, {
                    selected: false,
                    comments: new Map()
            });
        } else {
            if (this.selection.channels.get(this.getActiveChannel()).posts.get(id).selected) {
                input.checked = true;
                if (![...this.selection.channels.get(this.getActiveChannel()).posts.get(id).comments.values()].every(comment => comment.selected)) {
                    input.indeterminate = true;
                }
            }
        }
    }

    private createPostsListCheckboxes() {
        let posts = document.getElementsByClassName("ts-message-list-item");
        for (let i = 0; i < posts.length; i++) {
            this.insertPostCheckbox(<HTMLDivElement>posts.item(i));
        }

        document.querySelectorAll(".conversation-common.conversation-collapsed > thread-collapsed > div > .expand-collapse:not(.chevron-expanded)").forEach(expandComments => {

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
                                let collapse = (<HTMLDivElement>(<HTMLElement>node).querySelector(".conversation-common.conversation-collapsed > thread-collapsed > div > .expand-collapse:not(.chevron-expanded)"));
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

        let id = commentDiv.querySelector("thread-body > .thread-body").id;

        let input = <HTMLInputElement>document.createElement("input");
        input.id = `--embedded-chat-export-selector-comment-${id}`;
        input.type = "checkbox";
        input.classList.add("--embedded-chat-export-selector-comment");
        input.onclick = () => {
            let postId = commentDiv.parentElement.parentElement.parentElement.parentElement.attributes.getNamedItem("data-scroll-id").value;
            let post = this.selection.channels.get(this.getActiveChannel()).posts.get(postId);
            let postCheckbox = (<HTMLInputElement>document.getElementById(`--embedded-chat-export-selector-post-${postId}`));
            let comment = post.comments.get(id);
            comment.selected = input.checked;

            if (!input.checked && post.selected) {
                postCheckbox.indeterminate = true;
            } else if (input.checked && !post.selected) {
                postCheckbox.indeterminate = true;
                post.selected = true;
            }

            if (input.checked && [...post.comments.values()].every(comment => comment.selected)) {
                postCheckbox.indeterminate = false;
                postCheckbox.checked = true;
            }
        };
        insertPosition.insertAdjacentElement("beforeend", input);

        let post = this.selection.channels.get(this.getActiveChannel()).posts.get(commentDiv.parentElement.parentElement.parentElement.parentElement
            .attributes.getNamedItem("data-scroll-id").value);

        if (!post.comments.has(id)) {
            post.comments.set(id, {
                selected: false
            })
        } else {
            input.checked = post.comments.get(id).selected;
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
