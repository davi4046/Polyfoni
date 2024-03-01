import type Timeline from "./Timeline";
import type Voice from "./Voice";
import Model from "../../../shared/architecture/model/Model";
import type ParentChildState from "../../../shared/architecture/state/ParentChildState";

interface SectionState extends ParentChildState<Timeline, Voice> {}

class Section extends Model<Required<SectionState>> {}

export default Section;
