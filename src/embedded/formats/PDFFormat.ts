import {Format} from "./Format";
import {Message, Post} from "../Types";
import PDFDocument, {text} from "pdfkit";
import * as blobStream from "blob-stream";
import moment from "moment";

export class PDFFormat implements Format {
    async export(threads: Map<string, Post[]>): Promise<Map<string, string>> {
        let res = new Map<string, string>();

        for (const [thread, posts] of threads) {
            let doc = new PDFDocument();
            let stream = doc.pipe(blobStream());

            for (const post of posts) {
                post.messages = post.messages.sort((a: Message, b: Message) => a.sequenceId - b.sequenceId);
                let first = post.messages[0];

                // image

                let startingX = doc.x;
                let startingY = doc.y;

                doc.moveDown(1);

                let image = await fetch(`https://teams.microsoft.com/api/mt/emea/beta/users/${decodeURIComponent(first.from.substring(first.from.indexOf("/contacts/") + "/contacts/".length))}/profilepicturev2?displayname=${encodeURIComponent(first.imdisplayname)}&size=HR64x64}`)
                    .then(res => res.blob())
                    .then(blob => blob.arrayBuffer());

                doc.image(image, {width: 20, height: 20});

                // date/time

                doc
                    .fontSize(8)
                    .text(moment(first.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).format("dddd, Do MMMM YYYY, h:mm:ss a"), doc.x + 25, doc.y - 20, {align: "right", width: 400})
                    .fontSize(8)
                    .text(first.imdisplayname);

                // text content

                let contentElement = document.createElement("div");
                contentElement.innerHTML = first.content;
                doc .fontSize(8)
                    .moveDown()
                    .text(contentElement.textContent, {width: 400});
                doc.x -= 25;

                doc.moveDown(1);

                doc.rect(startingX, startingY, 440, doc.y - startingY).stroke();

                doc.moveDown(1);

                post.messages.slice(1).forEach(message => {

                });
            }
            doc.end();
            res.set(thread, stream.toBlobURL('application/pdf'));
        }

        return res;
    }

}
