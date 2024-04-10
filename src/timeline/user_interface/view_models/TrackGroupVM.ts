import type { SvelteComponent } from "svelte";

import Stateful from "../../../architecture/Stateful";

import type TrackVM from "./TrackVM";

interface TrackGroupVMState {
    label: string;
    tracks: TrackVM[];

    createIcon: (target: Element) => SvelteComponent;
}

export default class TrackGroupVM extends Stateful<TrackGroupVMState> {}
