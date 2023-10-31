import type { TimelineModel, TrackModel } from "./models";

import type { Writable } from "svelte/store";

export class Controller {
    private _clickedPos: number | null = null;
    private _clickedTrack: TrackModel | null = null;

    private _hoveredPos: number | null = null;
    private _hoveredTrack: TrackModel | null = null;

    public highlight: Highlight | null = null;

    setHoveredPos(newPos: number) {
        this._hoveredPos = newPos;
        this.updateHighlight();
    }

    setHoveredTrack(newTrack: TrackModel) {
        this._hoveredTrack = newTrack;
        this.updateHighlight();
    }

    updateHighlight() {
        if (
            this._hoveredPos &&
            this._hoveredTrack &&
            this._clickedPos &&
            this._clickedTrack
        ) {
            let tracks: TrackModel[] = [];

            let clickedVoice = this._clickedTrack.parent;
            let hoveredVoice = this._hoveredTrack.parent;

            if (clickedVoice && hoveredVoice) {
                let clickedTrackIndex = clickedVoice.children.indexOf(
                    this._clickedTrack
                );
                let hoveredTrackIndex = hoveredVoice.children.indexOf(
                    this._hoveredTrack
                );
                if (clickedVoice == hoveredVoice) {
                    let minTrackIndex = Math.min(
                        clickedTrackIndex,
                        hoveredTrackIndex
                    );
                    let maxTrackIndex = Math.max(
                        clickedTrackIndex,
                        hoveredTrackIndex
                    );

                    tracks = clickedVoice.children.slice(
                        minTrackIndex,
                        maxTrackIndex + 1
                    );
                } else {
                    let timeline = clickedVoice.parent!;

                    let clickedVoiceIndex =
                        timeline.children.indexOf(clickedVoice);
                    let hoveredVoiceIndex =
                        timeline.children.indexOf(hoveredVoice);

                    let minVoiceIndex = Math.min(
                        clickedVoiceIndex,
                        hoveredVoiceIndex
                    );
                    let maxVoiceIndex = Math.max(
                        clickedVoiceIndex,
                        hoveredVoiceIndex
                    );

                    tracks = timeline.children
                        .slice(minVoiceIndex + 1, maxVoiceIndex)
                        .map((voice) => {
                            return voice.children;
                        })
                        .flat();

                    if (clickedVoiceIndex < hoveredVoiceIndex) {
                        tracks = tracks.concat(
                            clickedVoice.children.slice(
                                clickedTrackIndex,
                                clickedVoice.children.length
                            )
                        );
                        tracks = tracks.concat(
                            hoveredVoice.children.slice(
                                0,
                                hoveredTrackIndex + 1
                            )
                        );
                    } else {
                        tracks = tracks.concat(
                            clickedVoice.children.slice(
                                0,
                                clickedTrackIndex + 1
                            )
                        );
                        tracks = tracks.concat(
                            hoveredVoice.children.slice(
                                hoveredTrackIndex,
                                hoveredVoice.children.length
                            )
                        );
                    }
                }
            }
            let clickedBeat = Math.round(this._clickedPos / 64);
            let hoveredBeat = Math.round(this._hoveredPos / 64);

            let minBeat = Math.min(clickedBeat, hoveredBeat);
            let maxBeat = Math.max(clickedBeat, hoveredBeat);

            this.highlight = new Highlight(tracks, [[minBeat, maxBeat]]);

            this._store.update((value) => {
                return value;
            });
        }
    }

    constructor(private _store: Writable<TimelineModel>) {
        document.addEventListener("mousedown", (_) => {
            if (this._hoveredPos) {
                this._clickedPos = this._hoveredPos;
            }
            if (this._hoveredTrack) {
                this._clickedTrack = this._hoveredTrack;
            }
        });

        document.addEventListener("mouseup", (_) => {
            this._clickedPos = null;
            this._clickedTrack = null;
        });

        document.addEventListener("mousemove", (event) => {
            let cursorArea = <HTMLElement>(
                document.getElementsByClassName("cursor-area")[0]
            );

            this.setHoveredPos(event.clientX - cursorArea.offsetLeft);
        });
    }
}

class Highlight {
    constructor(
        public tracks: TrackModel[],
        public intervals: [number, number][]
    ) {}
}
