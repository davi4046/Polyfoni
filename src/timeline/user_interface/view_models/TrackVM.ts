import type { SvelteComponent } from "svelte";

import type { GlobalEventHandler } from "../../../architecture/GlobalEventListener";
import Stateful from "../../../architecture/Stateful";

import type ItemVM from "./ItemVM";

interface TrackVMState {
    label: string;
    items: ItemVM[];
    createIcon?: (target: Element) => SvelteComponent;
    idPrefix: string;
    headerEventHandler?: GlobalEventHandler;
}

export default class TrackVM extends Stateful<TrackVMState> {}
