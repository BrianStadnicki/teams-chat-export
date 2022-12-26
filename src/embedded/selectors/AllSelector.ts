import {CheckboxSelector} from "./CheckboxSelector";

export class AllSelector extends CheckboxSelector {
    init() {
        this.enablePostHook = async () => true;
        super.init();
        this.startLoading();
    }
}
