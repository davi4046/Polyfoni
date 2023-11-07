export class ChangeTracker {
    private _changes: [object: Object, property: PropertyKey, newValue: any][] =
        [];

    get changes() {
        return this._changes;
    }

    reportChange(target: Object, property: PropertyKey, value: any) {
        this._changes.push([target, property, value]);
    }

    create<T extends Object>(object: T, ignoreProperties: PropertyKey[] = []) {
        Object.keys(object).forEach((property) => {
            if (ignoreProperties.includes(property)) {
                return;
            }
            this.reportChange(
                object,
                property,
                object[property as keyof typeof object]
            );
        });

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
