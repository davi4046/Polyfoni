import type Item from "../item/Item";
import type Voice from "../voice/Voice";
import type { ItemTypes } from "../../utils/ItemTypes";
import type ParentChildState from "../../../../shared/architecture/state/ParentChildState";
import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

interface TrackState<T extends keyof ItemTypes>
    extends ParentChildState<Voice, Item<T>> {
    readonly label: string;
}

function createTrackState<T extends keyof ItemTypes>(options: TrackState<T>) {
    return createWithDefaults(options, {});
}

export { type TrackState, createTrackState };
