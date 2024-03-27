import { uniqueId } from "lodash";

import Stateful from "./Stateful";

export default class Model<TState extends object> extends Stateful<TState> {
    constructor(
        state: TState,
        readonly id = uniqueId()
    ) {
        super(state);
    }
}
