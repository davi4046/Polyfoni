import IdProvider from "../id_provider/IdProvider";

import Stateful from "./Stateful";

export default class Model<TState extends object> extends Stateful<TState> {
    constructor(
        state: TState,
        readonly id = IdProvider.generateId()
    ) {
        super(state);
    }
}
