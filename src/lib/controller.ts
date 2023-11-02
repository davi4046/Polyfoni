import { get } from "svelte/store";

import { listen } from "@tauri-apps/api/event";

import { ItemModel, TimelineModel, TrackModel } from "./models";

import type { Writable } from "svelte/store";

export class Controller {
    private _hoverCursor = new TimelineCursor();
    private _clickCursor = new TimelineCursor();

    private _selectedItems: ItemModel[] = [];
    private _clickedOnItem = false;

    public highlight: HighlightModel | null = null;

    get selectedItems() {
        return this._selectedItems;
    }

    setHoveredTrack(newTrack: TrackModel) {
        this._hoverCursor.track = newTrack;
    }

    selectItem(item: ItemModel) {
        this._selectedItems = [item];

        this.highlight = null;

        this._store.update((value) => {
            return value;
        });

        this._clickedOnItem = true;
    }

    selectItemAdditive(item: ItemModel) {
        this._selectedItems.push(item);

        this.highlight = null;

        this._store.update((value) => {
            return value;
        });

        this._clickedOnItem = true;
    }

    deselectItem(item: ItemModel) {
        this._selectedItems = this._selectedItems.filter((x) => {
            return x !== item;
        });

        this.highlight = null;

        this._store.update((value) => {
            return value;
        });

        this._clickedOnItem = true;
    }

    private makeHighlight(from: TimelinePosition, to: TimelinePosition) {
        if (from.beat == to.beat) {
            return;
        }

        let timeline = get(this._store);

        let tracks = timeline.getTracksFromTo(from.track, to.track);

        if (tracks == null) {
            return;
        }

        console.log("to:", to);

        let minBeat = Math.floor(Math.min(from.beat, to.beat));
        let maxBeat = Math.ceil(Math.max(from.beat, to.beat));

        this.highlight = new HighlightModel(minBeat, maxBeat, tracks);

        this._selectedItems = [];

        this._store.update((value) => {
            return value;
        });
    }

    private drag() {
        let hoveredPosition = this._hoverCursor.getPosition();
        let clickedPosition = this._clickCursor.getPosition();

        if (hoveredPosition && clickedPosition) {
            if (this._clickedOnItem) {
                //perform item move
            } else {
                this.makeHighlight(clickedPosition, hoveredPosition);
            }
        }
    }

    constructor(private _store: Writable<TimelineModel>) {
        document.addEventListener("mousedown", (event) => {
            if (event.button != 0) {
                return;
            }
            if (this._hoverCursor.beat) {
                this._clickCursor.beat = this._hoverCursor.beat;
            }
            if (this._hoverCursor.track) {
                this._clickCursor.track = this._hoverCursor.track;
            }
        });

        document.addEventListener("mouseup", (_) => {
            this._clickCursor.beat = null;
            this._clickCursor.track = null;
            this._clickedOnItem = false;
        });

        document.addEventListener("mousemove", (event) => {
            let area = <HTMLElement>(
                document.getElementsByClassName("cursor-area")[0]
            );

            let pos = event.clientX - area.offsetLeft + area.scrollLeft;

            let timeline = get(this._store);

            let beat = Math.min(Math.max(pos / 64, 0), timeline.length);

            this._hoverCursor.beat = beat;
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

class TimelineCursor {
    public beat: number | null = null;
    public track: TrackModel | null = null;

    getPosition() {
        if (this.beat != null && this.track != null) {
            return new TimelinePosition(this.beat, this.track);
        } else {
            return null;
        }
    }
}

class TimelinePosition {
    constructor(
        public beat: number,
        public track: TrackModel
    ) {}
}
