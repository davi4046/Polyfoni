import type Section from "../section/Section";
import type Track from "../track/Track";
import Model from "../../../../shared/architecture/model/Model";
import type ParentChildState from "../../../../shared/architecture/state/ParentChildState";

interface VoiceState extends ParentChildState<Section, Track<any>> {}

class Voice extends Model<Required<VoiceState>> {}

export default Voice;
