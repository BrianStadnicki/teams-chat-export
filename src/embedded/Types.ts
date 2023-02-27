type JSON<T> = string & {__JSON__: T};

export interface Channel {
    id: string,
    teamId: string,
    threadProperties: {
        topics?: JSON<Topic[]>,
        spaceThreadTopic?: string,
        topic: string
    }
}

export interface Topic {
    id: string,
    name: string
}

export interface Post {
    messages: Message[]
}

export interface Message {
    id: string,
    clientmessageid?: string,
    content: string,
    conversationLink: string,
    conversationid: string,
    composetime: string,
    from: string,
    imdisplayname?: string,
    messagetype: string,
    originalarrivaltime: number,
    properties: {
        deletetime?: number
    }
    sequenceId: number
}
