class Stateful<TState extends object> {
    private _stateKeys: (keyof TState)[];

    private constructor(state: TState) {
        this.setState(state);
        this._stateKeys = Object.keys(state) as (keyof TState)[];
    }

    public setState(newState: Partial<TState>) {
        Object.assign(this, newState);
    }

    public getState(): TState {
        const state: Partial<TState> = {};

        this._stateKeys.forEach((key) => {
            state[key] = (this as unknown as TState)[key];
        });

        return state as TState;
    }

    static create<TState extends object>(state: TState) {
        return new Stateful(state) as Stateful<TState> & TState;
    }
}

export default Stateful;
