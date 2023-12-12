import IdProvider from "../id_provider/IdProvider";
import Stateful from "../stateful/Stateful";
import Subscribable from "../subscribable/Subscribable";

class Model<TState extends object> {
    readonly subscribable = new Subscribable(this);
    readonly state: Stateful<TState> & Required<TState>;
    readonly id = IdProvider.generateId();

    constructor(state: (model: Model<TState>) => Required<TState>) {
        this.state = Stateful.create(state(this));
    }
}

export default Model;
