/** Returns only the elements which are unique to each array */
export default function purifyArrays<T>(...arrays: readonly (readonly T[])[]) {
    const purifiedArrays = [];

    for (let i = 0; i < arrays.length; i++) {
        const array = arrays[i];
        const otherArrays = [...arrays.slice(0, i), ...arrays.slice(i + 1)];

        const purifiedArray = [];

        for (const element of array) {
            if (!isElementInAnyArray(element, otherArrays)) {
                purifiedArray.push(element);
            }
        }
        purifiedArrays.push(purifiedArray);
    }

    return purifiedArrays;
}

function isElementInAnyArray<T>(element: T, arrays: readonly (readonly T[])[]) {
    return arrays.some((array) => {
        return array.some((otherElement) => {
            return otherElement === element;
        });
    });
}
