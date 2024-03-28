export default function compareStates<TState extends object>(
    oldState: TState,
    newState: TState
): Set<keyof TState> {
    const updatedProps = new Set<keyof TState>();

    Object.entries(oldState).forEach(([key, oldValue]) => {
        const prop = key as keyof TState;
        const newValue = newState[prop];
        if (newValue !== oldValue) updatedProps.add(prop);
    });

    return updatedProps;
}
