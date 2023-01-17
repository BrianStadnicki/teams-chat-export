type JSON<T> = string & {__JSON__: T};

export interface Channel {
    id: string,
    teamId: string,
    threadProperties: {
        topics?: JSON<Topic[]>,
        spaceThreadTopic: string
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
    content: string,
    conversationLink: string,
    conversationid: string,
    composetime: string,
    imdisplayname?: string,
    messagetype: string,
    originalarrivaltime: number,
    properties: {
        deletetime?: number
    }
    sequenceId: number
}
