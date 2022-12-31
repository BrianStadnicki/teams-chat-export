import {Format} from "./Format";
import {Conversation, Message} from "../Types";

export class TXTFormat implements Format {
    export(threads: Map<string, Conversation[]>): Map<string, string> {
        let res = new Map<string, string>();

        threads.forEach((conversations, id) => {
            let text = conversations.map(conversation => {
                let messages: Message[] = Object.keys(conversation.messageMap).map(key => conversation.messageMap[key])
                    .sort((a: Message, b: Message) =>
                        a.sequenceId - b.sequenceId);

                messages.forEach((message: Message) => {
                    let div = document.createElement("div");
                    div.innerHTML = message.content;
                    message.content = div.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').replace(/[\u0250-\ue007]/g, '').trim();
                });

                return `${new Date(messages[0].originalArrivalTime).toString()} - ${messages[0].imDisplayName} wrote ${messages[0].content}\n` +
                    messages.slice(1).map(message =>
                        `${new Date(message.originalArrivalTime).toString()} - ${message.imDisplayName} replied ${message.content}`).join("\n");

            }).join("\n");

            res.set(`${id}.txt`, `data:text/plain;base64,${btoa(text)}`);
        });

        return res;
    }
}
