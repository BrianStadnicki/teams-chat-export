import {Selection} from "./Types";
import {Selector} from "./Selector";
import {CheckboxSelector} from "./selectors/CheckboxSelector";
import {AllSelector} from "./selectors/AllSelector";
import {DateSelector} from "./selectors/DateSelector";
import {getCurrentChannel} from "./Utils";

export class Sidebar {
    selection: Selection;
    selector: Selector;

    constructor() {
        this.selection = {
            channels: new Map()
        };
    }

    init() {
        let mainScreen = <HTMLDivElement>document.createElement("div");
        mainScreen.id = "--embedded-chat-export-main";
        mainScreen.innerHTML = `
                <form id="--embedded-chat-export-options-form">
                    <p>Export</p>
                    <input type="radio" class="--embedded-chat-export-options-form-selection" name="selection" id="--embedded-chat-export-options-form-selection-all" value="all">
                    <label for="--embedded-chat-export-options-form-selection-all">All</label>
                    <br>
                    <input type="radio" class="--embedded-chat-export-options-form-selection" name="selection" id="--embedded-chat-export-options-form-selection-custom" value="custom">
                    <label for="--embedded-chat-export-options-form-selection-custom">Custom</label>
                    <br>
                    <input type="radio" class="--embedded-chat-export-options-form-selection" name="selection" id="--embedded-chat-export-options-form-selection-date" value="date">
                    <label for="--embedded-chat-export-options-form-selection-date">In-between dates</label>
                    <input type="date" name="selection-date-lower">
                    <input type="date" name="selection-date-upper">
                    <br>
                    
                    <p>As</p>
                    <input type="radio" class="--embedded-chat-export-options-form-format" name="format" id="--embedded-chat-export-options-form-format-pdf" value="pdf">
                    <label for="--embedded-chat-export-options-form-format-pdf">PDF</label>
                    
                    <br>
                    
                    <button id="--embedded-chat-export-options-form-export">Export</button>
                    <button id="--embedded-chat-export-options-form-cancel">Cancel</button>
                </form>
        `;

        let form = (<HTMLFormElement>mainScreen.querySelector("#--embedded-chat-export-options-form"));
        let formElements = form.elements;
        for (let i = 0; i < formElements.length; i++) {
            if ((<HTMLInputElement>formElements.item(i)).name === "selection") {
                formElements.item(i).addEventListener("input", () => {
                    if (this.selector) this.selector.destroy();
                    this.selection = {channels: new Map()};

                    let options = new FormData(form);
                    switch(options.get("selection")) {
                        case "all":
                            this.selector = new AllSelector(this.selection);
                            break;
                        case "custom":
                            this.selector = new CheckboxSelector(this.selection);
                            break;
                        case "date":
                            this.selector = new DateSelector(this.selection, new Date(<string>options.get("selection-date-lower")), new Date(<string>options.get("selection-date-upper")));
                            break;
                        default:
                            return;
                    }

                    this.selector.init();
                });
            }
        }

        (<HTMLButtonElement>mainScreen.querySelector("#--embedded-chat-export-options-form-cancel")).onclick = (ev) => {
            ev.preventDefault();
            this.destroy();
        };

        (<HTMLButtonElement>mainScreen.querySelector("#--embedded-chat-export-options-form-export")).onclick = (ev) => {
            ev.preventDefault();

            let data = new FormData(<HTMLFormElement>mainScreen.querySelector("#--embedded-chat-export-options-form"));
            let format = data.get("format");
            switch (format) {
                case "pdf":
                    this.selector.destroy();
                    let notSelectedPosts = [...this.selection.channels.get(getCurrentChannel()).posts.entries()].filter((post) => !post[1].selected).map(post => post[0]);
                    let notSelectedComments = [...this.selection.channels.get(getCurrentChannel()).posts.entries()].filter((post) => post[1].selected).map(post => [...post[1].comments.entries()]).map(comments => comments.filter(comment => !comment[1].selected));
                    console.log(notSelectedPosts, notSelectedComments);
                    notSelectedPosts.forEach(post => {
                        let div = document.querySelector(`div[data-scroll-id="${post}"]`)
                        if (div) div.remove();
                    })
                    document.querySelector(".vr-item-placeholders").remove();
                    break;
            }
        }

        let channelList = (<HTMLDivElement>document.querySelector(".ts-channel-list"));
        channelList.style.display = "none";
        channelList.insertAdjacentElement("beforebegin", mainScreen);
    }

    destroy() {
        if (this.selector) this.selector.destroy();
        document.getElementById("--embedded-chat-export-main").remove();
        (<HTMLDivElement>document.querySelector(".ts-channel-list")).style.display = "initial";
    }
}
