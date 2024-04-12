import type { SvelteComponent } from "svelte";

import Stateful from "../../../architecture/Stateful";
import type { Menu } from "../../../utils/popup_menu/popup-menu-types";

import type TrackVM from "./TrackVM";

interface TrackGroupVMState {
    label: string;
    tracks: TrackVM[];
    createIcon?: (target: Element) => SvelteComponent;
    headerMenu?: Menu;
    noshow?: boolean;
}

export default class TrackGroupVM extends Stateful<TrackGroupVMState> {}
