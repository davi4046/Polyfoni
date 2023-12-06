class Subscribable {
    private _callbacks: ((value: Subscribable) => void)[] = [];

    readonly subscribe = (callback: (value: Subscribable) => void) => {
        this._callbacks.push(callback);
    };

    readonly notifySubscribers = () => {
        this._callbacks.forEach((callback) => callback(this));
    };
}

export default Subscribable;
