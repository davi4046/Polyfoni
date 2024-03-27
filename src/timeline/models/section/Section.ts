import Model from "../../../architecture/Model";
import type {
    ChildState,
    ParentState,
} from "../../../architecture/state-hierarchy-utils";

import type Timeline from "./Timeline";
import type Voice from "./Voice";

export interface SectionState
    extends ChildState<Timeline>,
        ParentState<Voice> {}

export default class Section extends Model<SectionState> {}
