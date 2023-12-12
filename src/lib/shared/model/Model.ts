import Subscribable from "../subscribable/Subscribable";
import randomId from "../utils/random_id/randomId";

class Model {
    readonly subscribable = new Subscribable(this);

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
