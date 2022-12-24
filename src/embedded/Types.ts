export interface Selection {
    channels: {
            id: string,
            name: string,
            posts: {
                    id: string,
                    selected: boolean,
                    comments: {
                            id: string,
                            selected: boolean
                    }[]
            }[]
    }[]
}
