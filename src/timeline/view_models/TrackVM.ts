import Model from "../../lib/architecture/Model";

import type ItemVM from "./ItemVM";

interface TrackVMState {
    label: string;
    items: ItemVM[];
}

export default class TrackVM extends Model<TrackVMState> {}
