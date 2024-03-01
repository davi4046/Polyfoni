import type Timeline from "../timeline/Timeline";
import type Voice from "../voice/Voice";
import type ParentChildState from "../../../../shared/architecture/state/ParentChildState";

interface SectionState extends ParentChildState<Timeline, Voice> {}

export type { SectionState as default };
