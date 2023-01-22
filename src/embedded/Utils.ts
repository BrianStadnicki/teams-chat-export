import {Channel} from "./Types";

export function htmlToContent(html: string) {
    let div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').replace(/[^\x00-\x7F]/g, '').trim();
}

export async function getChannel(id: string): Promise<Channel> {
    return new Promise((resolve, reject) => {
        window.indexedDB.databases().then(databases => {
            let openRequest = window.indexedDB.open(databases.find(database => database.name.startsWith("Teams:conversation-manager:")).name);
            openRequest.onsuccess = (event) => {
                let db = openRequest.result;
                const objectStore = db.transaction("conversations").objectStore("conversations");
                let request = objectStore.get(id);
                request.onsuccess = (event) => {
                    resolve(request.result);
                };
                request.onerror = (event) => {
                    reject(event);
                };
            };
            openRequest.onerror = (event) => {
                reject(event);
            };
        });
    });
}