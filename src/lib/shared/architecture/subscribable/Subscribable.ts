class Subscribable<T extends object> {
    constructor(private _obj: T) {}

    private _callbacks: ((value: T) => void)[] = [];

    readonly subscribe = (callback: (value: T) => void) => {
        this._callbacks.push(callback);
    };

    readonly notifySubscribers = () => {
        this._callbacks.forEach((callback) => callback(this._obj));
    };
}

export default Subscribable;
