import Model from "../../../architecture/Model";
import type {
    ChildState,
    ParentState,
} from "../../../architecture/state-hierarchy-utils";

import type Timeline from "./Timeline";
import type Voice from "./Voice";

interface SectionState extends ChildState<Timeline>, ParentState<Voice> {}

class Section extends Model<SectionState> {}

export default Section;
