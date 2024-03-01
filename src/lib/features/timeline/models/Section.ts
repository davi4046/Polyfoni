import Model from "../../../shared/architecture/Model";
import type { ParentChildState } from "../../../shared/architecture/state-hierarchy-utils";

import type Timeline from "./Timeline";
import type Voice from "./Voice";

interface SectionState extends ParentChildState<Timeline, Voice> {}

class Section extends Model<SectionState> {}

export default Section;
