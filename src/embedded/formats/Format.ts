import {Post} from "../Types";

export interface Format {
    export(threads: Map<string, Post[]>): Map<string, string>;
}
