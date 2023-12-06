import ViewModel from "../../../../shared/view_model/ViewModel";

import type Track from "../../models/track/Track";
import type TrackVMState from "./TrackVMState";

class TrackVM extends ViewModel<Track, TrackVMState> {}

export default TrackVM;