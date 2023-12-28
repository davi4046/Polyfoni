import type Model from "../model/Model";
import type { GetState } from "../state/state_utils";
import Stateful from "../stateful/Stateful";
import Subscribable from "../subscribable/Subscribable";

/**
 * A model which state is bound to the state of another model.
 */
class BoundModel<TModel extends Model<any>, TState extends object>
    implements GetState<TState>
{
    private _modelId: string;
    private _stateful: Stateful<TState> & Required<TState>;
    private _subscribable = new Subscribable(this);

    constructor(model: TModel, update: (model: TModel) => Required<TState>) {
        this._stateful = Stateful.create(update(model));
        this._modelId = model.id;

        model.subscribe((_) => {
            this._stateful.setState(update(model));
            this._subscribable.notifySubscribers();
        });

        this._subscribable.notifySubscribers();
    }

    get modelId() {
        return this._modelId;
    }

    get state(): Required<TState> {
        return this._stateful.getState() as Required<TState>;
    }

    subscribe(callback: (value: this) => void) {
        this._subscribable.subscribe(callback);
    }

    notifySubscribers() {
        this._subscribable.notifySubscribers();
    }
}

export default BoundModel;
