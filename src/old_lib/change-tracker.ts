import { clone } from "lodash";

export class ChangeTracker {
    private _changes = new Map<Object, Map<PropertyKey, any>>();

    get changes() {
        return this._changes;
    }

    private reportChange(target: Object, property: PropertyKey, value: any) {
        let targetMap = this._changes.get(target);

        if (!targetMap) {
            targetMap = new Map<PropertyKey, any>();
            this._changes.set(target, targetMap);
        }

        targetMap.set(property, clone(value));
    }

    create<T extends Object>(object: T, ignoreProperties: PropertyKey[] = []) {
        const tracker = this;

        return new Proxy(object, {
            deleteProperty: function (target, property) {
                delete target[property as keyof T];
                return true;
            },
            set: function (target, property, value, receiver) {
                target[property as keyof T] = value;

                if (!ignoreProperties.includes(property)) {
                    tracker.reportChange(target, property, value);
                }

                return true;
            },
        });
    }
}
