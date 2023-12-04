import Stateful from "../../../../shared/stateful/Stateful";

import type Track from "../../models/track/Track";
import type TrackVMState from "./TrackVMState";

class TrackVM extends Stateful<Track, TrackVMState> {}

export default TrackVM;
