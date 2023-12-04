type SubscribeCallback<T extends Subscribable> = (value: T) => void;

class Subscribable {
    private _callbacks: SubscribeCallback<Subscribable>[] = [];

    private _subscribe(callback: SubscribeCallback<Subscribable>) {
        this._callbacks.push(callback);
    }

    get subscribe() {
        return this._subscribe;
    }

    private _notifySubscribers() {
        this._callbacks.forEach((callback) => callback(this));
    }

    get notifySubscribers() {
        return this._notifySubscribers;
    }
}

export default Subscribable;
