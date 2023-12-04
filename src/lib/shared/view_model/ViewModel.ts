import Subscribable from "../subscribable/Subscribable";

class ViewModel<
    Model extends Subscribable,
    State extends object,
> extends Subscribable {
    private _state: State;

    get state() {
        return this._state;
    }

    constructor(model: Model, update: (model: Model) => State) {
        super();

        model.subscribe((_) => {
            this._state = update(model);
            this.notifySubscribers();
        });

        this._state = update(model);
        this.notifySubscribers();
    }
}

export default ViewModel;
