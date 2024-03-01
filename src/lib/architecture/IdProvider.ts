export default class IdProvider {
    private _usedIds: string[] = [];

    generateId(): string {
        let id = "";
        while (id === "" || this._usedIds.includes(id)) id = randomString(10);
        this._usedIds.push(id);
        return id;
    }
}

function randomString(length: number): string {
    return Array.from({ length }, randomChar).join("");
}

function randomChar(
    charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
): string {
    return charset[Math.floor(Math.random() * charset.length)];
}
