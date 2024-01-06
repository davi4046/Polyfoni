class Subscribable {
    private _callbacks: (() => void)[] = [];

    readonly subscribe = (callback: () => void) => {
        this._callbacks.push(callback);
    };

    readonly notifySubscribers = () => {
        this._callbacks.forEach((callback) => callback());
    };
}

export default Subscribable;
