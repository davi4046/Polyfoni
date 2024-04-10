import type { SvelteComponent } from "svelte";

import Stateful from "../../../architecture/Stateful";

import type TrackVM from "./TrackVM";

interface TrackGroupVMState {
    label: string;
    createIcon: (target: Element) => SvelteComponent;
    tracks: TrackVM[];
    noshow?: boolean;
}

export default class TrackGroupVM extends Stateful<TrackGroupVMState> {}
