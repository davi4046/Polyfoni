import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

import type Timeline from "../timeline/Timeline";
import type Voice from "../voice/Voice";

interface SectionState {
    readonly timeline: Timeline;
    readonly voices: Voice[];
}

function createSectionState(options: SectionState) {
    return createWithDefaults(options, {});
}

export { type SectionState, createSectionState };
