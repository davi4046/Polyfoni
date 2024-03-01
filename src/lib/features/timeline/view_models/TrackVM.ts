import Model from "../../../shared/architecture/model/Model";

import type ItemVM from "./ItemVM";

interface TrackVMState {
    label: string;
    items: ItemVM[];
}

class TrackVM extends Model<TrackVMState> {}

export default TrackVM;
