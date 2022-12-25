import {Selection} from "./Types";
import {getCurrentChannel} from "./Utils";

export class PostsSelector {
    selection: Selection;
    channel: string;
    observers: MutationObserver[];

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
        let posts = document.getElementsByClassName("--embedded-chat-export-selector-post");
        for (let i = 0; i < posts.length; i++) {
            document.removeChild(posts.item(i));
        }
        let comments = document.getElementsByClassName("--embedded-chat-export-selector-comment");
        for (let i = 0; i < comments.length; i++) {
            document.removeChild(comments.item(i));
        }
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
        input.classList.add("--embedded-chat-export-selector-post");
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

        if (!this.selection.channels.get(this.channel).posts.has(id)) {
            this.selection.channels.get(this.channel)
                .posts.set(id, {
                    selected: false,
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

    private createPostsListCheckboxes() {
        let posts = document.getElementsByClassName("ts-message-list-item");
        for (let i = 0; i < posts.length; i++) {
            this.insertPostCheckbox(<HTMLDivElement>posts.item(i));
        }

        document.querySelectorAll(".conversation-common.conversation-collapsed > thread-collapsed > div > .expand-collapse:not(.chevron-expanded)").forEach(expandComments => {

            (<HTMLDivElement>expandComments).click();
        })

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
                            }, 100);
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
        input.classList.add("--embedded-chat-export-selector-comment");
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
}
