import type Item from "../item/Item";
import type Voice from "../voice/Voice";
import type { ItemTypes } from "../../utils/ItemTypes";
import type ParentChildState from "../../../../shared/architecture/state/ParentChildState";

interface TrackState<T extends keyof ItemTypes>
    extends ParentChildState<Voice, Item<T>> {
    readonly label: string;
}

export type { TrackState as default };
