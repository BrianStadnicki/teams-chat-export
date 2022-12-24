import {Renderer} from "./Renderer";
import {Selection} from "./Types";

let selection: Selection = {
    channels: new Map()
};

let renderer = new Renderer(selection);
renderer.init();
