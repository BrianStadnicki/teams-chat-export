import {Message} from "./Types";

export class Messages {
    static async getAllMessages(chatService: string, skypeToken: string, channel: string): Promise<Message[][]> {
        return Messages.getThread(chatService, skypeToken, channel, 200)
            .then(async first => {
                let messages = first[0];
                let backwardLink = first[1];
                let previousEndTime: number = first[2];
                while (backwardLink !== undefined) {
                    await Messages.sleep(500);
                    let next = await Messages.getThread(chatService, skypeToken, channel, 200, new URL(backwardLink).searchParams.get("syncState"));
                    if (previousEndTime === next[2]) {
                        break;
                    } else {
                        previousEndTime = next[2];
                    }
                    messages.push(...next[0]);
                    backwardLink = next[1];
                }

                return (<Message[][]>Object.values(Messages.groupByKey((messages)
                        .filter(message => message.properties["deletetime"] === undefined)
                        .filter(message => message.messagetype.startsWith("RichText/") || message.messagetype === "Text")
                        .sort((a, b) => Date.parse(b.composetime) - Date.parse(a.composetime))
                    , 'conversationLink')))
                    .sort((a, b) => Date.parse(a[a.length - 1].composetime) - Date.parse(b[b.length - 1].composetime));
            });
    }

    static async getThread(chatService: string, skypeToken: string, channel: string, pageSize: number, syncState?: string): Promise<[Message[], string, number]> {
        return fetch(`${chatService}/v1/users/ME/conversations/${encodeURIComponent(channel)}/messages?pageSize=${pageSize}${
            syncState === undefined ? '' : `&syncState=${syncState}`}`, {
            headers: {
                authentication: `skypetoken=${skypeToken}`
            }
        })
            .then(res => res.json())
            .then(res => {
                return [res["messages"], res["_metadata"]["backwardLink"], res["_metadata"]["lastCompleteSegmentEndTime"]];
            });
    }

    private static groupByKey(list, key) {
        return list.reduce((hash, obj) => ({...hash, [obj[key]]:( hash[obj[key]] || [] ).concat(obj)}), {})
    }

    private static sleep(ms: number) {
        return new Promise((r) => setTimeout(r, ms));
    }

}