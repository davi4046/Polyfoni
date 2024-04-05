import Stateful from "../../../architecture/Stateful";

import type ItemVM from "./ItemVM";

interface TrackVMState {
    label: string;
    items: ItemVM[];

    idPrefix: string;
}

export default class TrackVM extends Stateful<TrackVMState> {}
