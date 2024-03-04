import Model from "../../../architecture/Model";
import type { ParentState } from "../../../architecture/state-hierarchy-utils";

import type Section from "./Section";

interface TimelineState extends ParentState<Section> {}

class Timeline extends Model<TimelineState> {}

export default Timeline;
