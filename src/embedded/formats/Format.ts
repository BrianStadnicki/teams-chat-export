import {Conversation} from "../Types";

export interface Format {
    export(threads: Map<string, Conversation[]>): Map<string, string>;
}
