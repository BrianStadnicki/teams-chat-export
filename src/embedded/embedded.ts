import {PostsSelector} from "./PostsSelector";
import {Selection} from "./Types";

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
        let renderer = new PostsSelector(selection);
        renderer.init();
    };
}, 50);

let selection: Selection = {
    channels: new Map()
};
