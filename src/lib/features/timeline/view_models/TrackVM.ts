import type ItemVM from "./ItemVM";
import Model from "../../../shared/architecture/model/Model";

interface TrackVMState {
    readonly label: string;
    readonly items: ItemVM[];
}

class TrackVM extends Model<Required<TrackVMState>> {}

export default TrackVM;
