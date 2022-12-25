import {PostsSelector} from "./PostsSelector";
import {Selection} from "./Types";

let selection: Selection = {
    channels: new Map()
};

let renderer = new PostsSelector(selection);
renderer.init();
