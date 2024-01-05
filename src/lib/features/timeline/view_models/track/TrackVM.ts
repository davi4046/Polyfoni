import BoundModel from "../../../../shared/architecture/bound_model/BoundModel";

import type Track from "../../models/track/Track";
import type { TrackVMState } from "./TrackVMState";

//@ts-ignore
class TrackVM extends BoundModel<Track<any>, Required<TrackVMState>, {}> {}

export default TrackVM;
