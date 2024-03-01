import type Section from "../section/Section";
import type ParentState from "../../../../shared/architecture/state/ParentState";

interface TimelineState extends ParentState<Section> {}

export type { TimelineState as default };
