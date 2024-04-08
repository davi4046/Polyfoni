import Stateful from "../../../architecture/Stateful";

import type TrackVM from "./TrackVM";

interface TrackGroupVMState {
    label?: string;
    tracks: TrackVM[];
}

export default class TrackGroupVM extends Stateful<TrackGroupVMState> {}
