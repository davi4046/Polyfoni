import { get } from "svelte/store";

import { listen } from "@tauri-apps/api/event";

import {
    GhostItemModel,
    HighlightModel,
    ItemModel,
    TimelineModel,
    TrackModel,
} from "./models";

import type { Writable } from "svelte/store";

export class Controller {
    private _hoveredBeat: number | null = null;
    private _hoveredTrack: TrackModel | null = null;
    private _hoveredItem: ItemModel | null = null;

    private _clickedBeat: number | null = null;
    private _clickedTrack: TrackModel | null = null;
    private _clickedItem: ItemModel | null = null;

    private _selectedItems: ItemModel[] = [];

    private _selectedItemOnClick = false;

    public highlight: HighlightModel | null = null;

    public ghostItems: GhostItemModel[] = [];

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
    }

    private makeGhostItems(
        fromBeat: number,
        toBeat: number,
        fromTrack: TrackModel,
        toTrack: TrackModel
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

        let beatOffset = Math.round(toBeat - fromBeat);

        beatOffset = Math.max(beatOffset, -minBeat);
        beatOffset = Math.min(beatOffset, timeline.length - maxBeat);

        /* Calculate Track Offset */

        let fromTrackIndex = fromTrack.getIndex()!;
        let toTrackIndex = toTrack.getIndex()!;

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

        let trackOffset = toTrackIndex - fromTrackIndex;

        trackOffset = Math.max(trackOffset, -minTrackIndex);
        trackOffset = Math.min(trackOffset, tracksPerVoice - 1 - maxTrackIndex);

        /* Calculate Voice Offset */

        let fromVoiceIndex = fromTrack.parent!.getIndex()!;
        let toVoiceIndex = toTrack.parent!.getIndex()!;

        let minVoiceIndex = this._selectedItems[0].parent!.parent!.getIndex()!;
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

        let voiceOffset = toVoiceIndex - fromVoiceIndex;

        voiceOffset = Math.max(voiceOffset, -minVoiceIndex);
        voiceOffset = Math.min(voiceOffset, voiceCount - 1 - maxVoiceIndex);

        let newGhostItems: GhostItemModel[] = [];

        if (beatOffset != 0 || trackOffset != 0 || voiceOffset != 0) {
            this._selectedItems.forEach((item) => {
                let newStart = item.start + beatOffset;
                let newEnd = newStart + item.end - item.start;
                let newTrackIndex = item.parent!.getIndex()! + trackOffset;
                let newVoiceIndex =
                    item.parent!.parent!.getIndex()! + voiceOffset;

                let newTrack =
                    timeline.children[newVoiceIndex].children[newTrackIndex];

                newGhostItems = newGhostItems.concat(
                    new GhostItemModel(item, newStart, newEnd, newTrack)
                );
            });
        } else {
            newGhostItems = [];
        }

        this.ghostItems = newGhostItems;
    }

    private placeGhostItems() {
        let isForwardMove =
            this.ghostItems[0].start > this.ghostItems[0].item.start;

        //sort items to avoid them clearing each other on move
        if (isForwardMove) {
            this.ghostItems.sort((a, b) => {
                if (a.item.start > b.item.start) {
                    return -1;
                } else {
                    return 1;
                }
            });
        } else {
            this.ghostItems.sort((a, b) => {
                if (a.item.start > b.item.start) {
                    return 1;
                } else {
                    return -1;
                }
            });
        }

        this.ghostItems.forEach((ghostItem) => {
            ghostItem.item.move(ghostItem.start, ghostItem.track);
        });

        this.ghostItems = [];
    }

    private drag() {
        if (
            this._hoveredBeat &&
            this._hoveredTrack &&
            this._clickedBeat &&
            this._clickedTrack
        ) {
            if (this._clickedItem) {
                this.makeGhostItems(
                    this._clickedBeat,
                    this._hoveredBeat,
                    this._clickedTrack,
                    this._hoveredTrack
                );
            } else {
                this.makeHighlight(
                    this._clickedBeat,
                    this._hoveredBeat,
                    this._clickedTrack,
                    this._hoveredTrack
                );
                this._selectedItems = [];
            }

            this._store.update((value) => {
                return value;
            });
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
                        this._selectedItemOnClick = true;
                    }
                } else {
                    this._selectedItems = [this._hoveredItem];
                    this._selectedItemOnClick = true;
                }

                this.highlight = null;

                this._store.update((value) => {
                    return value;
                });
            }
        });

        document.addEventListener("mouseup", (event) => {
            if (this.ghostItems.length == 0) {
                if (!this._selectedItemOnClick) {
                    this._selectedItems = this._selectedItems.filter((item) => {
                        return item !== this._hoveredItem;
                    });
                }
            } else {
                this.placeGhostItems();
            }

            this._store.update((value) => {
                return value;
            });

            this._clickedBeat = null;
            this._clickedTrack = null;
            this._clickedItem = null;
            this._selectedItemOnClick = false;
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
