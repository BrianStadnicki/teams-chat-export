import {Selection} from "../Types";
import {getCurrentChannel} from "../Utils";
import {Selector} from "../Selector";

export class CheckboxSelector implements Selector {
    selection: Selection;
    channel: string;
    observers: MutationObserver[];
    enablePostHook: (post: HTMLDivElement) => boolean;

    constructor(selection: Selection) {
        this.selection = selection;
        this.observers = [];
    }

    init() {
        this.channel = getCurrentChannel();
        this.selection.channels.set(this.channel, {posts: new Map()});
        this.createPostsListCheckboxes();
        this.createCommentsCheckboxes();
    }

    destroy() {
        this.selection.channels.delete(this.channel);
        document.querySelectorAll(".--embedded-chat-export-selector-post").forEach(post => post.remove());
        document.querySelectorAll(".--embedded-chat-export-selector-comment").forEach(comment => comment.remove());
        this.observers.forEach(observer => observer.disconnect());
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
        input.className = "--embedded-chat-export-selector-post";
        input.onclick = () => {
            let post = this.selection.channels.get(this.channel).posts.get(id);
            post.selected = input.checked;
            for (let key of post.comments.keys()) {
                let comment = <HTMLInputElement>document.getElementById(`--embedded-chat-export-selector-comment-${key}`);
                if (comment.checked !== input.checked) {
                    comment.click();
                }
            }
        };
        insertPosition.insertAdjacentElement("beforeend", input);

        let selected = this.enablePostHook ? this.enablePostHook(postDiv) : false;

        input.checked = selected;

        if (!this.selection.channels.get(this.channel).posts.has(id)) {
            this.selection.channels.get(this.channel)
                .posts.set(id, {
                    selected: selected,
                    comments: new Map()
            });
        } else {
            if (this.selection.channels.get(this.channel).posts.get(id).selected) {
                input.checked = true;
                if (![...this.selection.channels.get(this.channel).posts.get(id).comments.values()].every(comment => comment.selected)) {
                    input.indeterminate = true;
                }
            }
        }
    }

    createPostsListCheckboxes() {
        let posts = document.getElementsByClassName("ts-message-list-item");
        for (let i = 0; i < posts.length; i++) {
            this.insertPostCheckbox(<HTMLDivElement>posts.item(i));
        }

        document.querySelectorAll(".conversation-common.conversation-collapsed > thread-collapsed > div > .expand-collapse:not(.chevron-expanded)").forEach(expandComments => {
            (<HTMLDivElement>expandComments).click();
        })

        document.querySelectorAll(".ts-see-more-button.ts-see-more-fold").forEach(btn => (<HTMLButtonElement>btn).click());

        let observer = new MutationObserver((mutations, observer) => {
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

                                let showMore = (<HTMLElement>node).querySelector(".ts-see-more-button.ts-see-more-fold");
                                if (showMore) (<HTMLButtonElement>showMore).click();
                            }, 200);
                        }
                    });
                }
            });
        })
        observer.observe(document.getElementsByClassName("ts-message-list-container").item(0), {childList: true});
        this.observers.push(observer);
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
        input.className = "--embedded-chat-export-selector-comment";
        input.onclick = () => {
            let postId = commentDiv.parentElement.parentElement.parentElement.parentElement.attributes.getNamedItem("data-scroll-id").value;
            let post = this.selection.channels.get(this.channel).posts.get(postId);
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

        let post = this.selection.channels.get(this.channel).posts.get(commentDiv.parentElement.parentElement.parentElement.parentElement
            .attributes.getNamedItem("data-scroll-id").value);

        if (!post.comments.has(id)) {
            post.comments.set(id, {
                selected: post.selected
            });
            input.checked = post.selected;
        } else {
            input.checked = post.comments.get(id).selected;
        }
    }

    createCommentsCheckboxes() {
        document.querySelectorAll(".conversation-reply").forEach(node => {
            this.insertCommentCheckbox(<HTMLDivElement>node);
        });

        let observer = new MutationObserver((mutations) => {
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
        })
        observer.observe(document.getElementsByClassName("ts-message-list-container").item(0), {childList: true, subtree: true});
        this.observers.push(observer);
    }

    private loadingInterval: number;
    private oldestPostChecks: number;
    private oldestPostId: string;

    startLoading() {
        this.oldestPostChecks = 0;
        this.loadingInterval = setInterval(() => {
            document.querySelector(".ts-message-list-container").scrollIntoView();
            let oldestMessage = document.querySelector(".ts-message-list-item");
            let currentId = oldestMessage.getAttribute("data-scroll-id");
            if (currentId !== this.oldestPostId) {
                this.oldestPostId = currentId;
                this.oldestPostChecks = 0;
            } else {
                this.oldestPostChecks += 1;
            }
            if (this.oldestPostChecks === 5) {
                this.stopLoading();
            }
        }, 500);

        document.querySelector(".ts-tab-bar-wrapper").insertAdjacentHTML("beforeend", `
            <p id="--embedded-chat-export-top-bar-loading">Loading...</p>
            <button id="--embedded-chat-export-top-bar-loading-cancel">Cancel</button>
        `);

        document.getElementById("--embedded-chat-export-top-bar-loading-cancel").onclick = () => {
            this.stopLoading();
        };
    }

    stopLoading() {
        clearInterval(this.loadingInterval);
        document.getElementById("--embedded-chat-export-top-bar-loading").remove();
        document.getElementById("--embedded-chat-export-top-bar-loading-cancel").remove();
    }
}
