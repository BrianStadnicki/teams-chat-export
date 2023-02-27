import {Format} from "./Format";
import {Message, Post} from "../Types";
import jsPDF from "jspdf";
import "jspdf-autotable";

export class PDFFormat implements Format {
    async export(threads: Map<string, Post[]>): Promise<Map<string, string>> {
        let res = new Map<string, string>();

        for (const [thread, posts] of threads) {
            let doc = new jsPDF();
            doc.setFontSize(8);
            doc.internal.pageSize.width

            let offset = 20;

            for (const post of posts) {
                post.messages = post.messages.sort((a: Message, b: Message) => a.sequenceId - b.sequenceId);
                let first = post.messages[0];

                // image

                let image = await fetch(`https://teams.microsoft.com/api/mt/emea/beta/users/${decodeURIComponent(first.from.substring(first.from.indexOf("/contacts/") + "/contacts/".length))}/profilepicturev2?displayname=${encodeURIComponent(first.imdisplayname)}&size=HR64x64}`)
                    .then(res => res.blob())
                    .then(blob => blob.arrayBuffer())
                    .then(buffer => new Uint8Array(buffer));


                doc.addImage(image, 10, offset + 5, 10, 10);

                // text content

                let contentElement = document.createElement("div");
                contentElement.innerHTML = first.content;
                let textHeight = doc.getTextDimensions(contentElement.textContent, {maxWidth: 150}).h;
                doc.text(contentElement.textContent, 25, offset + 5, {maxWidth: 150});

                post.messages.slice(1).forEach(message => {

                });

                offset += 5 + textHeight + 10;

                if (offset > 290) {
                    doc.addPage();
                    offset = 20;
                }
            }

            res.set(thread, doc.output("datauristring"));
        }

        return res;
    }

}
