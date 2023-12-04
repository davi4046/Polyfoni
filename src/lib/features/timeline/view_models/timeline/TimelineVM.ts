import Stateful from "../../../../shared/stateful/Stateful";

import type Timeline from "../../models/timeline/Timeline";
import type TimelineVMState from "./TimelineVMState";

class TimelineVM extends Stateful<Timeline, TimelineVMState> {}

export default TimelineVM;
