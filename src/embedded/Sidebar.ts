import {Selection} from "./Types";
import {Selector} from "./Selector";
import {CheckboxSelector} from "./selectors/CheckboxSelector";
import {AllSelector} from "./selectors/AllSelector";

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
                    <button id="--embedded-chat-export-options-form-cancel">Cancel</button>
                </form>
        `;

        let form = (<HTMLFormElement>mainScreen.querySelector("#--embedded-chat-export-options-form"));
        let formElements = form.elements;
        for (let i = 0; i < formElements.length; i++) {
            formElements.item(i).addEventListener("input", () => {
                if (this.selector) this.selector.destroy();

                switch(new FormData(form).get("selection")) {
                    case "all":
                        this.selector = new AllSelector(this.selection);
                        break;
                    case "custom":
                        this.selector = new CheckboxSelector(this.selection);
                        break;
                }

                this.selector.init();
            })
        }

        (<HTMLButtonElement>mainScreen.querySelector("#--embedded-chat-export-options-form-cancel")).onclick = (ev) => {
            ev.preventDefault();
            this.destroy();
        };

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
