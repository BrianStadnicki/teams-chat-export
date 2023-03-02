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

                await this.renderContent(doc, first.content);

                doc.x -= 25;

                doc.moveDown(1);

                doc
                    .lineWidth(1)
                    .moveTo(doc.x, doc.y)
                    .lineTo(doc.x + 440, doc.y)
                    .stroke();

                // doc.rect(startingX, startingY, 440, doc.y - startingY).stroke();

                doc.moveDown(1);

                post.messages.slice(1).forEach(message => {

                });
            }
            doc.end();
            res.set(thread, stream.toBlobURL('application/pdf'));
        }

        return res;
    }

    async renderContent(doc: PDFKit.PDFDocument, content: string) {
        console.log(content);

        let contentDOM = new DOMParser().parseFromString(content, "text/html");

        let handleElement = async (element: ChildNode) => {
            switch (element.nodeName) {
                case "A":
                    doc
                        .fontSize(8)
                        .text(element.textContent, {
                            width: 400,
                            continued: true,
                            link: (<HTMLAnchorElement>element).href
                        });
                    return;
                case "IMG":
                    let image: any;
                    let imageURL = (<HTMLImageElement>element).src;

                    if (imageURL === "") return;
                    if (imageURL.includes(".gif")) return;

                    if (imageURL.includes(".asm.skype.com/v1/objects/")) {
                        image = await fetch((<HTMLImageElement>element).src,
                            {
                                "referrer": "https://teams.microsoft.com/",
                                "referrerPolicy": "strict-origin-when-cross-origin",
                                "body": null,
                                "method": "GET",
                                "mode": "cors",
                                "credentials": "include"
                            }).then(image => image.blob()).then(image => image.arrayBuffer());
                    } else {
                        image = await fetch(imageURL,
                            {
                                "referrer": "https://teams.microsoft.com/",
                                "referrerPolicy": "strict-origin-when-cross-origin",
                                "body": null,
                                "method": "GET",
                                "mode": "cors",
                                "credentials": "same-origin"
                            }).then(image => image.blob()).then(image => image.arrayBuffer());
                    }

                    console.log(image);

                    if ((<HTMLImageElement>element).getAttribute("itemtype") === "http://schema.skype.com/Emoji") {
                        return;
                    }

                    doc.moveDown();

                    if ((<HTMLImageElement>element).style.width !== "") {
                        let width = parseInt((<HTMLImageElement>element).style.width.replace("px", ""));
                        let height = parseInt((<HTMLImageElement>element).style.height.replace("px", ""));
                        if (width > 400) {
                            doc.image(image, {fit: [400, 600]});
                        } else {
                            doc.image(image, {width: width, height: height});
                        }
                    } else {
                        doc.image(image, {fit: [400, 600]});
                    }

            }

            if (element.hasChildNodes()) {
                for (let i = 0; i < element.childNodes.length; i++) {
                    await handleElement(element.childNodes.item(i));
                }
            } else {
                switch (element.nodeName) {
                    case "#text":
                        doc
                            .fontSize(8)
                            .text(element.textContent, {width: 400, continued: true});
                        break;
                    case "DIV":
                        doc.moveDown();
                        break;
                }
            }
        };

        for (let i = 0; i < contentDOM.childNodes.length; i++) {
            await handleElement(contentDOM.childNodes.item(i));
        }
    }

}
