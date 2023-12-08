import type Model from "../model/Model";
import Stateful from "../stateful/Stateful";

class ViewModel<TModel extends Model, TState extends object> extends Stateful<
    Required<TState>
> {
    readonly modelId: string;

    constructor(model: TModel, update: (model: TModel) => Required<TState>) {
        super(update(model));

        this.modelId = model.id;

        model.subscribe((_) => {
            this._setState(update(model));
            this.notifySubscribers();
        });

        this.notifySubscribers();
    }

    get state() {
        return this._getState();
    }
}

export default ViewModel;
