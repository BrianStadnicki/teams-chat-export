import {CheckboxSelector} from "./CheckboxSelector";
import {Selection} from "../Types";
import {getCurrentChannel} from "../Utils";

export class DateSelector extends CheckboxSelector {
    lower: Date;
    upper: Date;

    constructor(selection: Selection, lower: Date, upper: Date) {
        super(selection);
        this.lower = lower;
        this.upper = upper;
    }

    init() {
        this.enablePostHook = (postDiv) => {
            return new Promise((resolve, reject) => {
                let channelId = getCurrentChannel();
                let postId = postDiv.attributes.getNamedItem("data-scroll-id").value;
                let messageId = postDiv.children.item(0).id.replace("t", "");

                window.indexedDB.databases().then(databases => {
                    let openRequest = window.indexedDB.open(databases.find(database => database.name.startsWith("Teams:replychain-manager:")).name);
                    openRequest.onsuccess = (event) => {
                        let db = openRequest.result;
                        const objectStore = db.transaction("replychains").objectStore("replychains");
                        let request = objectStore.index("byMessageSearchKeys").get(`${channelId}_${messageId}`)
                        request.onsuccess = (event) => {
                            const post = request.result;
                            let message = post["messageMap"][`${postId.substring(0, 44)}_${postId.substring(44)}`];
                            let date = new Date(message["originalArrivalTime"]);

                            resolve(this.lower <= date && date <= this.upper);
                        }
                    };
                });
            });
        };

        super.init();
        this.startLoading();
    }
}
