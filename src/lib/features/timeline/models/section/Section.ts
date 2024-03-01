import type Timeline from "../timeline/Timeline";
import type Voice from "../voice/Voice";
import Model from "../../../../shared/architecture/model/Model";
import type ParentChildState from "../../../../shared/architecture/state/ParentChildState";

interface SectionState extends ParentChildState<Timeline, Voice> {}

class Section extends Model<Required<SectionState>> {}

export default Section;
