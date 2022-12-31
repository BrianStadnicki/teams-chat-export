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

export interface Conversation {
    conversationId: string,
    messageMap: object
}

export interface Message {
    id: string,
    content: string,
    imDisplayName: string,
    messageType: string,
    originalArrivalTime: number,
    sequenceId: number
}
