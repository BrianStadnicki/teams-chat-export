import {CheckboxSelector} from "./CheckboxSelector";

export class AllSelector extends CheckboxSelector {
    init() {
        super.init();
        this.startLoading();
    }
}
