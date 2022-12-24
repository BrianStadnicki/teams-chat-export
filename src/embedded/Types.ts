export interface Selection {
        channels: Map<string, {
                posts: Map<string, {
                        selected: boolean,
                        comments: Map<string, {
                                selected: boolean
                        }>
        }>
}>
}
