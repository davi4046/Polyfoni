import { get } from "svelte/store";

import { listen } from "@tauri-apps/api/event";

import { HighlightModel, ItemModel, TimelineModel, TrackModel } from "./models";

import type { Writable } from "svelte/store";
export class Controller {
    private _clickedPos: number | null = null;
    private _clickedTrack: TrackModel | null = null;

    private _hoveredPos: number | null = null;
    private _hoveredTrack: TrackModel | null = null;

    private _selectedItems: ItemModel[] = [];
    private _clickedOnItem = false;

    public highlight: HighlightModel | null = null;

    setHoveredTrack(newTrack: TrackModel) {
        this._hoveredTrack = newTrack;
        this.updateHighlight();
    }

    updateHighlight() {
        if (
            this._hoveredPos &&
            this._hoveredTrack &&
            this._clickedPos &&
            this._clickedTrack &&
            !this._clickedOnItem
        ) {
            let clickedBeat = Math.round(this._clickedPos / 64);
            let hoveredBeat = Math.round(this._hoveredPos / 64);

            if (clickedBeat == hoveredBeat) {
                return;
            }

            let timeline = get(this._store);

            let tracks = timeline.getTracksFromTo(
                this._clickedTrack,
                this._hoveredTrack
            );

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

    get selectedItems() {
        return this._selectedItems;
    }

    constructor(private _store: Writable<TimelineModel>) {
        document.addEventListener("mousedown", (event) => {
            if (event.button != 0) {
                return;
            }
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

            this._hoveredPos = newPos;
            this.updateHighlight();
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
