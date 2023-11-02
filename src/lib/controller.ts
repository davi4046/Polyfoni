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
        this._hoverCursor.y = newTrack;
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
        let clickedBeat = Math.round(from.x / 64);
        let hoveredBeat = Math.round(to.x / 64);

        if (clickedBeat == hoveredBeat) {
            return;
        }

        let timeline = get(this._store);

        let tracks = timeline.getTracksFromTo(from.y, to.y);

        if (tracks == null) {
            return;
        }

        let minBeat = Math.min(clickedBeat, hoveredBeat);
        let maxBeat = Math.max(clickedBeat, hoveredBeat);

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
            if (this._hoverCursor.x) {
                this._clickCursor.x = this._hoverCursor.x;
            }
            if (this._hoverCursor.y) {
                this._clickCursor.y = this._hoverCursor.y;
            }
        });

        document.addEventListener("mouseup", (_) => {
            this._clickCursor.x = null;
            this._clickCursor.y = null;
            this._clickedOnItem = false;
        });

        document.addEventListener("mousemove", (event) => {
            let cursorArea = <HTMLElement>(
                document.getElementsByClassName("cursor-area")[0]
            );

            let newPos =
                event.screenX - cursorArea.offsetLeft + cursorArea.scrollLeft;

            newPos = Math.min(
                Math.max(newPos, 0),
                cursorArea.offsetWidth + cursorArea.scrollLeft
            );

            this._hoverCursor.x = newPos;
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
    public x: number | null = null;
    public y: TrackModel | null = null;

    getPosition() {
        if (this.x && this.y) {
            return new TimelinePosition(this.x, this.y);
        } else {
            return null;
        }
    }
}

class TimelinePosition {
    constructor(
        public x: number,
        public y: TrackModel
    ) {}
}
