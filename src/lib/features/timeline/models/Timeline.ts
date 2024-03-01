import Model from "../../../shared/architecture/Model";
import type { ParentState } from "../../../shared/architecture/state-hierarchy-utils";

import type Section from "./Section";

interface TimelineState extends ParentState<Section> {}

class Timeline extends Model<TimelineState> {}

export default Timeline;
