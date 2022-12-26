import {CheckboxSelector} from "./CheckboxSelector";

export class AllSelector extends CheckboxSelector {
    init() {
        this.enablePostHook = (post) => true;
        super.init();
        this.startLoading();
    }
}
