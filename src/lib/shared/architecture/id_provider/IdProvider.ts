import randomId from "./random_id/randomId";

export default class IdProvider {
    private _usedIds: string[] = [];

    generateId(): string {
        let id = "";
        while (id === "" || this._usedIds.includes(id)) id = randomId(10);
        this._usedIds.push(id);
        return id;
    }
}
