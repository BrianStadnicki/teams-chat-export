import {PostsSelector} from "./PostsSelector";
import {Selection} from "./Types";
import {getCurrentChannel} from "./Utils";

setInterval(() => {
    if (document.getElementById("--embedded-chat-export-menu-export")) return;

    let menus = document.getElementsByClassName("app-default-menu-ul");
    if (menus.length !== 1) return;

    menus.item(0).insertAdjacentHTML("beforeend", `
        <div id="--embedded-chat-export-menu-export">
            <li role="presentation" tabindex="0" class="more-options-item show-top-divider">
                <a role="menuitem" aria-haspopup="false" aria-expanded="false" class="ts-sym has-icon" tabindex="-1">
                    <ng-include class="icon" ng-if="menuItem.svgPath" src="menuItem.svgPath">
                        <svg viewBox="0 0 28 28" role="presentation" class="app-svg icons-msft-sharepoint icons-msft-office-no-padding" focusable="false">
                        
                        </svg>
                    </ng-include>
                    <span class="ts-popover-label">Export</span>
                </a>
            </li>
        </div>
    `);

    let selector = new PostsSelector(selection);

    document.getElementById("--embedded-chat-export-menu-export").onclick = () => {
        selector.init();
    };

    let originalChannel = getCurrentChannel();
    window.addEventListener("hashchange", () => {
        if (originalChannel !== getCurrentChannel()) {
            selector.destroy();
        }
    });


}, 50);

let selection: Selection = {
    channels: new Map()
};
