import type Model from "../model/Model";
import Subscribable from "../subscribable/Subscribable";

class ViewModel<
    TModel extends Model,
    TState extends object,
> extends Subscribable {
    private _state: TState;

    get state() {
        return this._state;
    }

    readonly modelId: string;

    constructor(model: TModel, update: (model: TModel) => TState) {
        super();

        this.modelId = model.id;

        model.subscribe((_) => {
            this._state = update(model);
            this.notifySubscribers();
        });

        this._state = update(model);
        this.notifySubscribers();
    }
}

export default ViewModel;
