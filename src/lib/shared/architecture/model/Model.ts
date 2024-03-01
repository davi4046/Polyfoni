import IdProvider from "../id_provider/IdProvider";

import Stateful from "../stateful/Stateful";

const modelIdProvider = new IdProvider();

export default class Model<TState extends object> extends Stateful<TState> {
    constructor(
        state: TState,
        readonly id = modelIdProvider.generateId()
    ) {
        super(state);
    }
}
