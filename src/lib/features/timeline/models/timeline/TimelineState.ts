import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

import type Section from "../section/Section";

interface TimelineState {
    readonly top: Section;
    readonly center: Section;
    readonly bottom: Section;
}

function createTimelineState(options: TimelineState) {
    return createWithDefaults(options, {});
}

export { type TimelineState, createTimelineState };
