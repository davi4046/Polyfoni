import Stateful from "../stateful/Stateful";
import Subscribable from "../subscribable/Subscribable";
import randomId from "../utils/random_id/randomId";

class Model<TState extends object> {
    readonly subscribable = new Subscribable(this);
    readonly state: Stateful<TState> & Required<TState>;

    constructor(state: (model: Model<TState>) => Required<TState>) {
        this.state = Stateful.create(state(this));
    }

    private static _usedIds: string[] = [];

    private static _uniqueId(): string {
        let id = "";
        while (id === "" || this._usedIds.includes(id)) id = randomId(10);
        Model._usedIds.push(id);
        return id;
    }

    readonly id = Model._uniqueId();
}

export default Model;
