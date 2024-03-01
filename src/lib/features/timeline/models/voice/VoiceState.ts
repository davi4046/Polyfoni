import type Section from "../section/Section";
import type Track from "../track/Track";
import type ParentChildState from "../../../../shared/architecture/state/ParentChildState";

interface VoiceState extends ParentChildState<Section, Track<any>> {}

export type { VoiceState as default };
