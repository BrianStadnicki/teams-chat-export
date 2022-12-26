import {Sidebar} from "./Sidebar";

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

    document.getElementById("--embedded-chat-export-menu-export").onclick = () => {
        let sidebar = new Sidebar();
        sidebar.init();
    };
}, 50);
