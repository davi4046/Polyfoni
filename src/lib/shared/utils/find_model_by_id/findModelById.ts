import Model from "../../model/Model";

function findModelById(object: Object, id: string): Model | null {
    if (object instanceof Model) {
        if (object.id === id) return object;
    }

    for (const value of Object.values(object)) {
        if (!(value instanceof Object)) continue;
        const result = findModelById(value, id);
        if (result !== null) return result;
    }

    return null;
}

export default findModelById;
