import {Message} from "./Types";
import moment = require("moment");

export class Messages {
    static async getAllMessages(chatService: string, skypeToken: string, channel: string): Promise<Message[][]> {
        return Messages.getThread(chatService, skypeToken, channel, 20, "0")
            .then(async first => {
                let messages = first[0];
                let backwardLink = first[1];
                while (backwardLink !== undefined) {
                    let next = await Messages.getThread(chatService, skypeToken, channel, 20, "0", new URL(backwardLink).searchParams.get("syncState"));
                    messages.push(...next[0]);
                    backwardLink = next[1];
                }

                return (<Message[][]>Object.values(Messages.groupByKey((messages)
                        .filter(message => message.properties["deletetime"] === undefined)
                        .filter(message => message.messagetype.startsWith("RichText/") || message.messagetype === "Text")
                        .sort((a, b) => moment(b.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).diff(moment(a.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS)))
                    , 'conversationLink')))
                    .sort((a, b) => moment(a[a.length - 1].composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).diff(moment(b[b.length - 1].composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS)));
            });
    }

    static async getThread(chatService: string, skypeToken: string, channel: string, pageSize: number, startTime: string, syncState?: string): Promise<[Message[], string]> {
        return fetch(`${chatService}/v1/users/ME/conversations/${encodeURIComponent(channel)}/messages?view=msnp24Equivalent|supportsMessageProperties&startTime=${startTime}&pageSize=${pageSize}${
            syncState === undefined ? '' : `&syncState=${syncState}`}`, {
            headers: {
                authentication: `skypetoken=${skypeToken}`
            }
        })
            .then(res => res.json())
            .then(res => {
                return [res["messages"], res["_metadata"]["backwardLink"]];
            });
    }

    private static groupByKey(list, key) {
        return list.reduce((hash, obj) => ({...hash, [obj[key]]:( hash[obj[key]] || [] ).concat(obj)}), {})
    }
}