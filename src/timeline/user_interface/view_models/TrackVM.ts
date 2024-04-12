import type { SvelteComponent } from "svelte";

import Stateful from "../../../architecture/Stateful";
import type { Menu } from "../../../utils/popup_menu/popup-menu-types";

import type ItemVM from "./ItemVM";

interface TrackVMState {
    label: string;
    items: ItemVM[];
    createIcon?: (target: Element) => SvelteComponent;
    headerMenu?: Menu;

    idPrefix: string;
}

export default class TrackVM extends Stateful<TrackVMState> {}
