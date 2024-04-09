import type { SvelteComponent } from "svelte";

import Stateful from "../../../architecture/Stateful";

import type ItemVM from "./ItemVM";

interface TrackVMState {
    label: string;
    items: ItemVM[];

    createIcon?: (target: Element) => SvelteComponent;

    idPrefix: string;
}

export default class TrackVM extends Stateful<TrackVMState> {}
