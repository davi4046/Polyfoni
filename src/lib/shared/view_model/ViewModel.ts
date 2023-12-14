import type Model from "../model/Model";
import Stateful from "../stateful/Stateful";
import Subscribable from "../subscribable/Subscribable";

class ViewModel<TModel extends Model<any>, TState extends object> {
    private _subscribable = new Subscribable(this);
    readonly state: Stateful<TState> & Required<TState>;
    readonly modelId: string;

    constructor(model: TModel, update: (model: TModel) => Required<TState>) {
        this.state = Stateful.create(update(model));
        this.modelId = model.id;

        model.subscribe((_) => {
            this.state.setState(update(model));
            this._subscribable.notifySubscribers();
        });

        this._subscribable.notifySubscribers();
    }

    subscribe(callback: (value: this) => void) {
        this._subscribable.subscribe(callback);
    }

    notifySubscribers() {
        this._subscribable.notifySubscribers();
    }
}

export default ViewModel;
