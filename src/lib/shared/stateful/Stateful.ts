class Stateful<TState extends object> {
    private stateKeys: (keyof TState)[];

    private constructor(state: TState) {
        this.setState(state);
        this.stateKeys = Object.keys(state) as (keyof TState)[];
    }

    public setState(newState: TState) {
        Object.assign(this, newState);
    }

    public getState(): TState {
        const state: Partial<TState> = {};

        this.stateKeys.forEach((key) => {
            state[key] = (this as unknown as TState)[key];
        });

        return state as TState;
    }

    static create<TState extends object>(state: TState) {
        return new Stateful(state) as Stateful<TState> & TState;
    }
}

export default Stateful;
