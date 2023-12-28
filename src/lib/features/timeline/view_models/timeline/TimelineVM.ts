import BoundModel from "../../../../shared/architecture/bound_model/BoundModel";

import type Timeline from "../../models/timeline/Timeline";
import type { TimelineVMState } from "./TimelineVMState";

class TimelineVM extends BoundModel<Timeline, TimelineVMState> {}

export default TimelineVM;
