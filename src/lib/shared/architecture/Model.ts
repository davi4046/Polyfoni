import IdProvider from "./IdProvider";

import Stateful from "./Stateful";

const modelIdProvider = new IdProvider();

export default class Model<TState extends object> extends Stateful<TState> {
    constructor(
        state: TState,
        readonly id = modelIdProvider.generateId()
    ) {
        super(state);
    }
}
