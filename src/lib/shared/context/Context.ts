import type Model from "../model/Model";
import Subscribable from "../subscribable/Subscribable";

class Context<T extends Model> extends Subscribable {
    constructor(readonly model: T) {
        super();
    }
}

export default Context;
