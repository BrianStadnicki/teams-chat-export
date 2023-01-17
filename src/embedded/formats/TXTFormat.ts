import {Format} from "./Format";
import {Post, Message} from "../Types";

export class TXTFormat implements Format {
    export(threads: Map<string, Post[]>): Map<string, string> {
        let res = new Map<string, string>();

        threads.forEach((conversations, id) => {
            let text = conversations.map(conversation => {
                let messages: Message[] = conversation.messages
                    .sort((a: Message, b: Message) =>
                        a.sequenceId - b.sequenceId);

                messages.forEach((message: Message) => {
                    let div = document.createElement("div");
                    div.innerHTML = message.content;
                    message.content = div.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').replace(/[^\x00-\x7F]/g, '').trim();
                });

                return `${new Date(messages[0].originalarrivaltime).toString()} - ${messages[0].imdisplayname} wrote ${messages[0].content}\n` +
                    messages.slice(1).map(message =>
                        `${new Date(message.originalarrivaltime).toString()} - ${message.imdisplayname} replied ${message.content}`).join("\n") +
                    (messages.length === 1 ? "" : "\n");
            }).join("\n");

            res.set(`${id}.txt`, `data:text/plain;base64,${btoa(text.replace(/[\u0250-\ue007]/g, ''))}`);
        });

        return res;
    }
}
