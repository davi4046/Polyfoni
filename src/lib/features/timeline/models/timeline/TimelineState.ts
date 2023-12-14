import type ParentState from "../../../../shared/state/ParentState";
import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

import type Section from "../section/Section";

interface TimelineState extends ParentState<Section> {}

function createTimelineState(options: TimelineState) {
    return createWithDefaults(options, {});
}

export { type TimelineState, createTimelineState };
