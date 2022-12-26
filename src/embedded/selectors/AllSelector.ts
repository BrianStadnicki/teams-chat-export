import {CheckboxSelector} from "./CheckboxSelector";

export class AllSelector extends CheckboxSelector {
    init() {
        this.enablePostHook = () => true;
        super.init();
        this.startLoading();
    }
}
