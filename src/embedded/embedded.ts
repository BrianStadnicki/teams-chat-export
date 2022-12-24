import {Renderer} from "./Renderer";
import {Selection} from "./Types";

let selection: Selection = {
    channels: []
};

let renderer = new Renderer(selection);
renderer.init();
