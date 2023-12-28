import BoundModel from "../../../../shared/architecture/bound_model/BoundModel";

import type Track from "../../models/track/Track";
import type { TrackVMState } from "./TrackVMState";

class TrackVM extends BoundModel<Track, TrackVMState> {}

export default TrackVM;
