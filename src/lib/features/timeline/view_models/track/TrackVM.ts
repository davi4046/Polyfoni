import ViewModel from '../../../../shared/view_model/ViewModel';

import type Track from "../../models/track/Track";
import type { TrackVMState } from "./TrackVMState";

type TrackVM = ViewModel<Track, TrackVMState> & Required<TrackVMState>;

export type { TrackVM as default };
