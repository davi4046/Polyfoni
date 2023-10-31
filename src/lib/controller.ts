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
            let clickedBeat = Math.round(this._clickedPos / 64);
            let hoveredBeat = Math.round(this._hoveredPos / 64);

            let start = Math.min(clickedBeat, hoveredBeat);
            let end = Math.max(clickedBeat, hoveredBeat);

            let tracks: TrackModel[] = [];

            let clickedTrackVoice = this._clickedTrack.parent;
            let hoveredTrackVoice = this._hoveredTrack.parent;

            if (clickedTrackVoice && hoveredTrackVoice) {
                if (clickedTrackVoice == hoveredTrackVoice) {
                    //single-voice highlight
                    let clickedTrackIndex = clickedTrackVoice.children.indexOf(
                        this._clickedTrack
                    );
                    let clickedVoiceIndex = clickedTrackVoice.children.indexOf(
                        this._hoveredTrack
                    );

                    let minIndex = Math.min(
                        clickedTrackIndex,
                        clickedVoiceIndex
                    );
                    let maxIndex = Math.max(
                        clickedTrackIndex,
                        clickedVoiceIndex
                    );

                    tracks = clickedTrackVoice.children.slice(
                        minIndex,
                        maxIndex + 1
                    );
                } else {
                    //cross-voice highlight
                    let timeline = clickedTrackVoice.parent!;

                    let clickedVoiceIndex =
                        timeline.children.indexOf(clickedTrackVoice);
                    let hoveredVoiceIndex =
                        timeline.children.indexOf(hoveredTrackVoice);

                    let minIndex = Math.min(
                        clickedVoiceIndex,
                        hoveredVoiceIndex
                    );
                    let maxIndex = Math.max(
                        clickedVoiceIndex,
                        hoveredVoiceIndex
                    );

                    tracks = timeline.children
                        .slice(minIndex + 1, maxIndex)
                        .map((voice) => {
                            return voice.children;
                        })
                        .flat();

                    let clickedTrackIndex = clickedTrackVoice.children.indexOf(
                        this._clickedTrack
                    );

                    let hoveredTrackIndex = hoveredTrackVoice.children.indexOf(
                        this._hoveredTrack
                    );

                    if (clickedVoiceIndex > hoveredVoiceIndex) {
                        tracks = tracks.concat(
                            clickedTrackVoice.children.slice(
                                0,
                                clickedTrackIndex + 1
                            )
                        );
                        tracks = tracks.concat(
                            hoveredTrackVoice.children.slice(
                                hoveredTrackIndex,
                                hoveredTrackVoice.children.length
                            )
                        );
                    } else {
                        tracks = tracks.concat(
                            clickedTrackVoice.children.slice(
                                clickedTrackIndex,
                                clickedTrackVoice.children.length
                            )
                        );
                        tracks = tracks.concat(
                            hoveredTrackVoice.children.slice(
                                0,
                                hoveredTrackIndex + 1
                            )
                        );
                    }
                }
            }

            this.highlight = new Highlight(tracks, [[start, end]]);

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
