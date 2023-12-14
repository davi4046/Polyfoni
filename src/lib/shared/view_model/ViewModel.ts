import type Model from "../model/Model";
import Stateful from "../stateful/Stateful";
import Subscribable from "../subscribable/Subscribable";

class ViewModel<TModel extends Model<any>, TState extends object> {
    private _subscribable = new Subscribable(this);
    private _state: Stateful<TState> & Required<TState>;
    readonly modelId: string;

    constructor(model: TModel, update: (model: TModel) => Required<TState>) {
        this._state = Stateful.create(update(model));
        this.modelId = model.id;

        model.subscribe((_) => {
            this._state.setState(update(model));
            this._subscribable.notifySubscribers();
        });

        this._subscribable.notifySubscribers();
    }

    set state(newState: Partial<TState>) {
        this._state.setState(newState);
    }

    get state(): Required<TState> {
        return this._state.getState() as Required<TState>;
    }

    subscribe(callback: (value: this) => void) {
        this._subscribable.subscribe(callback);
    }

    notifySubscribers() {
        this._subscribable.notifySubscribers();
    }
}

export default ViewModel;
