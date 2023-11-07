export class Observer {
    private _initialValues = new Map<Object, Map<PropertyKey, any>>();
    private _changes = new Map<Object, Map<PropertyKey, any>>();

    get changes() {
        return this._changes;
    }

    addObservable(observable: Object, watchProperties: PropertyKey[]) {
        this._initialValues.set(observable, new Map());
        this._changes.set(observable, new Map());

        watchProperties.forEach((property) => {
            let value = observable[property as keyof typeof observable];
            this._initialValues.get(observable)!.set(property, value);
        });
    }

    reportChange(target: Object, property: PropertyKey, value: any) {
        const targetMap = this._changes.get(target);

        if (targetMap) {
            let initialValue = this._initialValues.get(target)?.get(property);

            if (value == initialValue) {
                targetMap.delete(property);
            } else {
                targetMap.set(property, value);
            }
        }
    }

    flush() {
        this._changes.forEach((map, object) => {
            map.forEach((value, property) => {
                this._initialValues.get(object)?.set(property, value);
            });
            this._changes.set(object, new Map());
        });
    }
}

export abstract class Observable {
    static create<T extends Object>(
        object: T,
        observer: Observer,
        watchProperties: PropertyKey[]
    ) {
        observer.addObservable(object, watchProperties);
        return new Proxy(object, {
            deleteProperty: function (target, property) {
                delete target[property as keyof T];
                return true;
            },
            set: function (target, property, value, receiver) {
                target[property as keyof T] = value;
                if (watchProperties.includes(property)) {
                    observer.reportChange(target, property, value);
                }
                return true;
            },
        });
    }
}
