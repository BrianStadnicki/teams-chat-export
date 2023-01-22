import {Format} from "./Format";
import {Message, Post} from "../Types";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import {htmlToContent} from "../Utils";
import moment = require("moment");

export class PDFFormat implements Format {
    export(threads: Map<string, Post[]>): Map<string, string> {
        let res = new Map<string, string>();

        for (const [thread, posts] of threads) {
            let doc = new jsPDF();
            doc.setFontSize(10);

            let body = [];
            posts.forEach(post => {
                post.messages = post.messages.sort((a: Message, b: Message) => a.sequenceId - b.sequenceId);
                let first = post.messages[0];
                body.push([{content: first.imdisplayname, styles: {fillColor: [255, 255, 255]}}, {content: moment(first.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).format("ddd, MMM Do YYYY, h:mm:ss a"), styles: {fillColor: [255, 255, 255]}}, {content: htmlToContent(first.content), styles: {fillColor: [255, 255, 255]}}]);
                post.messages.slice(1).forEach(message => {
                    body.push([{content: message.imdisplayname, styles: {fillColor: [181, 181, 181]}}, {content: moment(message.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).format("ddd, MMM Do YYYY, h:mm:ss a"), styles: {fillColor: [181, 181, 181]}}, {content: htmlToContent(message.content), styles: {fillColor: [181, 181, 181]}}]);
                });
            });

            autoTable(doc, {
                head: [["Sender", "Time", "Content"]],
                body: body
            });
            res.set(`${thread}.pdf`, doc.output("datauristring"));
        }

        return res;
    }

}
