import Model from "../../../architecture/Model";

import type ItemVM from "./ItemVM";

interface TrackVMState {
    label: string;
    items: ItemVM[];

    idPrefix: string;
}

export default class TrackVM extends Model<TrackVMState> {}
