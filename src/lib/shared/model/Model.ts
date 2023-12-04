import Subscribable from "../subscribable/Subscribable";
import randomId from "../utils/randomId";

class Model extends Subscribable {
    private static _usedIds: string[] = [];

    private static _uniqueId(): string {
        let id = "";
        while (id === "" || this._usedIds.includes(id)) id = randomId(10);
        Model._usedIds.push(id);
        return id;
    }

    readonly id = Model._uniqueId();

    constructor() {
        super();
    }
}

export default Model;
