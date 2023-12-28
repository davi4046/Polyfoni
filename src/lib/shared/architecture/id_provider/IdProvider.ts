import randomId from "../../utils/random_id/randomId";

abstract class IdProvider {
    private static _usedIds: string[] = [];

    static generateId(): string {
        let id = "";
        while (id === "" || this._usedIds.includes(id)) id = randomId(10);
        this._usedIds.push(id);
        return id;
    }
}

export default IdProvider;
