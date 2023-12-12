import Model from "../../model/Model";

function findModelById<TModel extends Model>(
    object: Object,
    id: string
): TModel | null {
    const checkedObjects: Object[] = [];

    const checkRecursively = (object: Object): TModel | null => {
        checkedObjects.push(object);

        if (object instanceof Model) {
            if (object.id === id) return object as TModel;
        }

        for (const value of Object.values(object)) {
            if (!(value instanceof Object) || checkedObjects.includes(value)) {
                continue;
            }
            const result = checkRecursively(value);
            if (result !== null) return result;
        }

        return null;
    };

    return checkRecursively(object);
}

export default findModelById;
