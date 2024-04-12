export function moveElementUp<T>(arr: T[], index: number): void {
    if (index > 0 && index < arr.length) {
        const element = arr[index];
        arr.splice(index, 1); // Remove the element from the array
        arr.splice(index - 1, 0, element); // Insert the element one index up
    }
}

export function moveElementDown<T>(arr: T[], index: number): void {
    if (index >= 0 && index < arr.length - 1) {
        const element = arr[index];
        arr.splice(index, 1); // Remove the element from the array
        arr.splice(index + 1, 0, element); // Insert the element one index down
    }
}
