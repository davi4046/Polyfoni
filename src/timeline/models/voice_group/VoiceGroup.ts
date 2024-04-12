import type Timeline from "../timeline/Timeline";
import type Voice from "../voice/Voice";
import Stateful from "../../../architecture/Stateful";
import type {
    ChildState,
    ParentState,
} from "../../../architecture/state-hierarchy-utils";

export interface SectionState
    extends ChildState<Timeline>,
        ParentState<Voice> {}

export default class VoiceGroup extends Stateful<SectionState> {}
