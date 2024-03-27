export default function compareArrays<T>(oldArray: T[], newArray: T[]) {
    const removedItems = oldArray.filter((child) => {
        return !newArray.includes(child);
    });

    const addedItems = newArray.filter((child) => {
        return !oldArray.includes(child);
    });

    return { removedItems, addedItems };
}
