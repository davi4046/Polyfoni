import type Section from "../section/Section";
import Model from "../../../../shared/architecture/model/Model";
import type ParentState from "../../../../shared/architecture/state/ParentState";

interface TimelineState extends ParentState<Section> {}

class Timeline extends Model<Required<TimelineState>> {}

export default Timeline;
