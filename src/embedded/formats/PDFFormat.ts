import {Format} from "./Format";
import {Message, Post} from "../Types";
import PDFDocument from "pdfkit";
import * as blobStream from "blob-stream";

export class PDFFormat implements Format {
    async export(threads: Map<string, Post[]>): Promise<Map<string, Blob>> {
        let res = new Map<string, Blob>();

        for (const [thread, posts] of threads) {
            let doc = new PDFDocument();
            let stream = doc.pipe(blobStream());

            for (const post of posts) {
                post.messages = post.messages.sort((a: Message, b: Message) => a.sequenceId - b.sequenceId);
                let first = post.messages[0];

                // image

                doc.moveDown(1);

                let image = await fetch(`https://teams.microsoft.com/api/mt/emea/beta/users/${decodeURIComponent(first.from.substring(first.from.indexOf("/contacts/") + "/contacts/".length))}/profilepicturev2?displayname=${encodeURIComponent(first.imdisplayname)}&size=HR64x64}`)
                    .then(res => res.blob())
                    .then(blob => blob.arrayBuffer());

                doc.image(image, {width: 20, height: 20});

                // sender and date

                doc
                    .fontSize(8)
                    .text(new Date(Date.parse(first.composetime)).toLocaleString(), doc.x + 25, doc.y - 20, {align: "right", width: 400})
                    .text(first.imdisplayname)
                    .moveDown();

                // text content

                await this.renderContent(doc, first.content);

                doc.x -= 25;

                doc.moveDown(1);

                doc.x += 20;

                for (const message of post.messages.slice(1)) {
                    doc.moveDown();

                    // image

                    image = await fetch(`https://teams.microsoft.com/api/mt/emea/beta/users/${decodeURIComponent(message.from.substring(message.from.indexOf("/contacts/") + "/contacts/".length))}/profilepicturev2?displayname=${encodeURIComponent(message.imdisplayname)}&size=HR64x64}`)
                        .then(res => res.blob())
                        .then(blob => blob.arrayBuffer());

                    doc.image(image, {width: 20, height: 20});

                    // sender and date

                    doc
                        .fontSize(8)
                        .text(new Date(Date.parse(message.composetime)).toLocaleString(), doc.x + 25, doc.y - 20, {align: "right", width: 400})
                        .text(message.imdisplayname, doc.x + 25)
                        .moveDown();

                    doc.x -= 25;

                    // content

                    await this.renderContent(doc, message.content);
                }

                doc.x -= 20;

                doc
                    .moveDown()
                    .lineWidth(1)
                    .moveTo(doc.x, doc.y)
                    .lineTo(doc.x + 440, doc.y)
                    .stroke();

                doc.moveDown();
            }
            doc.end();
            res.set(thread, stream.toBlob('application/pdf'));
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

                    if ((<HTMLImageElement>element).getAttribute("itemtype") === "http://schema.skype.com/Emoji") {
                        return;
                    }

                    doc.moveDown();

                    let width = parseInt((<HTMLImageElement>element).style.width.replace("px", "")) * (72 / 96);
                    let height = parseInt((<HTMLImageElement>element).style.height.replace("px", "")) * (72 / 96);

                    if (width === undefined || height == undefined) {
                        width = (<HTMLImageElement>element).width * (72 / 96);
                        height = (<HTMLImageElement>element).height * (72 / 96);
                    }

                    if (height > 842 - 72 - doc.y) {
                        doc.addPage();
                    }

                    if (width > 400) {
                        doc.image(image, {fit: [400, 600]});
                    } else {
                        doc.image(image, {width: width, height: height});
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
