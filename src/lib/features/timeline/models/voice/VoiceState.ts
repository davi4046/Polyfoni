import type ParentChildState from "../../../../shared/state/ParentChildState";
import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

import type Section from "../section/Section";
import type Track from "../track/Track";

interface VoiceState extends ParentChildState<Section, Track> {}

function createVoiceState(options: VoiceState) {
    return createWithDefaults(options, {});
}

export { type VoiceState, createVoiceState };
