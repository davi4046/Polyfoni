import ViewModel from '../../../../shared/view_model/ViewModel';

import type Timeline from "../../models/timeline/Timeline";
import type { TimelineVMState } from "./TimelineVMState";

type TimelineVM = ViewModel<Timeline, TimelineVMState> &
    Required<TimelineVMState>;

export type { TimelineVM as default };
