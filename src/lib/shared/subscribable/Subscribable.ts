type SubscribeCallback<T extends Subscribable> = (value: T) => void;

class Subscribable {
    private _callbacks: SubscribeCallback<Subscribable>[] = [];

    readonly subscribe = (callback: SubscribeCallback<Subscribable>) => {
        this._callbacks.push(callback);
    };

    readonly notifySubscribers = () => {
        this._callbacks.forEach((callback) => callback(this));
    };
}

export default Subscribable;
