import type ParentChildState from "../../../../shared/architecture/state/ParentChildState";
import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

import type Timeline from "../timeline/Timeline";
import type Voice from "../voice/Voice";

interface SectionState extends ParentChildState<Timeline, Voice> {}

function createSectionState(options: SectionState) {
    return createWithDefaults(options, {});
}

export { type SectionState, createSectionState };
