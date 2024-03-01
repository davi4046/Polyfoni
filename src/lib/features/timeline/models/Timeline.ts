import Model from "../../../shared/architecture/model/Model";
import type { ParentState } from "../../../shared/architecture/state/state-hierarchy-utils";

import type Section from "./Section";

interface TimelineState extends ParentState<Section> {}

class Timeline extends Model<TimelineState> {}

export default Timeline;
