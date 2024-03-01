import Model from "../../../shared/architecture/model/Model";
import type ParentChildState from "../../../shared/architecture/state/ParentChildState";

import type Timeline from "./Timeline";
import type Voice from "./Voice";

interface SectionState extends ParentChildState<Timeline, Voice> {}

class Section extends Model<SectionState> {}

export default Section;
