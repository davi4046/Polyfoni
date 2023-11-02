import { get } from "svelte/store";

import { listen } from "@tauri-apps/api/event";

import { ItemModel, TimelineModel, TrackModel, VoiceModel } from "./models";

import type { Writable } from "svelte/store";

export class Controller {
    private _hoveredBeat: number | null = null;
    private _hoveredTrack: TrackModel | null = null;
    private _hoveredItem: ItemModel | null = null;

    private _clickedBeat: number | null = null;
    private _clickedTrack: TrackModel | null = null;
    private _clickedItem: ItemModel | null = null;

    private _selectedItems: ItemModel[] = [];

    public highlight: HighlightModel | null = null;

    get selectedItems() {
        return this._selectedItems;
    }

    setHoveredItem(newItem: ItemModel | null) {
        this._hoveredItem = newItem;
    }

    setHoveredTrack(newTrack: TrackModel | null) {
        this._hoveredTrack = newTrack;
    }

    private makeHighlight(
        fromBeat: number,
        toBeat: number,
        fromTrack: TrackModel,
        toTrack: TrackModel
    ) {
        if (fromBeat == toBeat) {
            return;
        }

        let timeline = get(this._store);

        let tracks = timeline.getTracksFromTo(fromTrack, toTrack);

        if (tracks == null) {
            return;
        }

        let minBeat = Math.floor(Math.min(fromBeat, toBeat));
        let maxBeat = Math.ceil(Math.max(fromBeat, toBeat));

        this.highlight = new HighlightModel(minBeat, maxBeat, tracks);

        this._selectedItems = [];

        this._store.update((value) => {
            return value;
        });
    }

    private drag() {
        if (
            this._hoveredBeat &&
            this._hoveredTrack &&
            this._clickedBeat &&
            this._clickedTrack
        ) {
            if (this._clickedItem) {
                //perform item move
            } else {
                this.makeHighlight(
                    this._clickedBeat,
                    this._hoveredBeat,
                    this._clickedTrack,
                    this._hoveredTrack
                );
            }
        }
    }

    constructor(private _store: Writable<TimelineModel>) {
        document.addEventListener("mousedown", (event) => {
            if (event.button != 0) {
                return;
            }
            if (this._hoveredBeat) {
                this._clickedBeat = this._hoveredBeat;
            }
            if (this._hoveredTrack) {
                this._clickedTrack = this._hoveredTrack;
            }
            if (this._hoveredItem) {
                this._clickedItem = this._hoveredItem;

                if (event.shiftKey) {
                    if (!this._hoveredItem.isSelected()) {
                        this._selectedItems.push(this._hoveredItem);
                    }
                } else {
                    this._selectedItems = [this._hoveredItem];
                }

                this.highlight = null;

                this._store.update((value) => {
                    return value;
                });
            }
        });

        document.addEventListener("mouseup", (_) => {
            if (
                this._hoveredBeat &&
                this._hoveredTrack &&
                this._clickedBeat &&
                this._clickedTrack &&
                this._clickedItem
            ) {
                let timeline = get(this._store);

                /* Calculate Beat Offset */

                let minBeat = this._selectedItems[0].start;
                let maxBeat = this._selectedItems[0].end;

                this._selectedItems.forEach((item) => {
                    if (item.start < minBeat) {
                        minBeat = item.start;
                    }
                    if (item.end > maxBeat) {
                        maxBeat = item.end;
                    }
                });

                let beatOffset = Math.round(
                    this._hoveredBeat - this._clickedBeat
                );

                beatOffset = Math.max(beatOffset, -minBeat);
                beatOffset = Math.min(beatOffset, timeline.length - maxBeat);

                /* Calculate Track Offset */

                let clickedTrackIndex = this._clickedTrack.getIndex()!;
                let hoveredTrackIndex = this._hoveredTrack.getIndex()!;

                let minTrackIndex = this._selectedItems[0].parent!.getIndex()!;
                let maxTrackIndex = minTrackIndex;

                this._selectedItems.forEach((item) => {
                    let trackIndex = item.parent!.getIndex()!;

                    if (trackIndex < minTrackIndex) {
                        minTrackIndex = trackIndex;
                    }

                    if (trackIndex > maxTrackIndex) {
                        maxTrackIndex = trackIndex;
                    }
                });

                const tracksPerVoice = 5; //IMPORTANT: Update if number of tracks per voice increases

                let trackOffset = hoveredTrackIndex - clickedTrackIndex;

                trackOffset = Math.max(trackOffset, -minTrackIndex);
                trackOffset = Math.min(
                    trackOffset,
                    tracksPerVoice - 1 - maxTrackIndex
                );

                /* Calculate Voice Offset */

                let clickedVoiceIndex = this._clickedTrack.parent!.getIndex()!;
                let hoveredVoiceIndex = this._hoveredTrack.parent!.getIndex()!;

                let minVoiceIndex =
                    this._selectedItems[0].parent!.parent!.getIndex()!;
                let maxVoiceIndex = minVoiceIndex;

                this._selectedItems.forEach((item) => {
                    let voiceIndex = item.parent!.parent!.getIndex()!;

                    if (voiceIndex < minVoiceIndex) {
                        minVoiceIndex = voiceIndex;
                    }

                    if (voiceIndex > maxVoiceIndex) {
                        maxVoiceIndex = voiceIndex;
                    }
                });

                let voiceCount = timeline.children.length;

                let voiceOffset = hoveredVoiceIndex - clickedVoiceIndex;

                voiceOffset = Math.max(voiceOffset, -minVoiceIndex);
                voiceOffset = Math.min(
                    voiceOffset,
                    voiceCount - 1 - maxVoiceIndex
                );

                /* Perform Move */

                //sort items to avoid them clearing each other on move
                this._selectedItems.sort((a, b) => {
                    if (a.start > b.start) {
                        return beatOffset > 0 ? -1 : 1;
                    } else {
                        return beatOffset > 0 ? 1 : -1;
                    }
                });

                this._selectedItems.forEach((item) => {
                    let newStart = item.start + beatOffset;
                    let newTrackIndex = item.parent!.getIndex()! + trackOffset;
                    let newVoiceIndex =
                        item.parent!.parent!.getIndex()! + voiceOffset;

                    let newTrack =
                        timeline.children[newVoiceIndex].children[
                            newTrackIndex
                        ];

                    item.move(newStart, newTrack);
                });
            }

            this._store.update((value) => {
                return value;
            });

            this._clickedBeat = null;
            this._clickedTrack = null;
            this._clickedItem = null;
        });

        document.addEventListener("mousemove", (event) => {
            let area = <HTMLElement>(
                document.getElementsByClassName("cursor-area")[0]
            );

            let pos = event.clientX - area.offsetLeft + area.scrollLeft;

            let timeline = get(this._store);

            let beat = Math.min(Math.max(pos / 64, 0), timeline.length);

            this._hoveredBeat = beat;
            this.drag();
        });

        listen("insert", (_) => {
            if (this.highlight) {
                this.highlight.tracks.forEach((track) => {
                    let newItem = new ItemModel(
                        this.highlight!.start,
                        this.highlight!.end
                    );
                    track.addChild(newItem);
                });
                this.highlight = null;

                this._store.update((value) => {
                    return value;
                });
            }
        });

        listen("delete", (_) => {
            if (this.highlight) {
                this.highlight.tracks.forEach((track) => {
                    track.clearInterval(
                        this.highlight!.start,
                        this.highlight!.end
                    );
                });
                this.highlight = null;
            }

            this._selectedItems.forEach((item) => {
                item.parent = null;
            });

            this._selectedItems = [];

            this._store.update((value) => {
                return value;
            });
        });
    }
}

export class HighlightModel {
    constructor(
        public start: number,
        public end: number,
        public tracks: TrackModel[]
    ) {}
}
