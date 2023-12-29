import Model from "../../../../shared/architecture/model/Model";

import type Item from "../item/Item";

import type { TrackState } from "./TrackState";

class Track<TItem extends Item<any>> extends Model<TrackState<TItem>> {}

export default Track;
