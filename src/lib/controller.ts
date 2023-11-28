import { clone } from "lodash";
import { onMount } from "svelte";

import { ChangeTracker } from "./change-tracker";
import Popup from "./components/Popup.svelte";
import PauseIcon from "./components/svg/PauseIcon.svelte";
import PlayIcon from "./components/svg/PlayIcon.svelte";
import { Generator } from "./generator";
import HotkeyHandler from "./hotkeys";
import {
    HighlightModel,
    ItemData,
    ItemHandleModel,
    ItemModel,
    NoteModel,
    TimelineModel,
    TrackModel,
    VoiceModel,
} from "./models";

const audioContext = new window.AudioContext();

function playNote(value: number, duration: number) {
    let frequency = 440 * Math.pow(2, (value - 69) / 12);

    const oscillator = audioContext.createOscillator();

    oscillator.type = "square";
    oscillator.frequency.value = frequency; // value in hertz
    oscillator.connect(audioContext.destination);
    oscillator.start();

    setTimeout(function () {
        oscillator.stop();
    }, duration);
}

export class Controller {
    private _hoveredBeat: number | null = null;
    private _hoveredTrack: TrackModel | null = null;
    private _hoveredItem: ItemModel | null = null;
    private _hoveredHandle: ItemHandleModel | null = null;

    private _clickedBeat: number | null = null;
    private _clickedTrack: TrackModel | null = null;
    private _clickedItem: ItemModel | null = null;
    private _clickedHandle: ItemHandleModel | null = null;

    private _selectedItems: ItemModel[] = [];
    private _selectedItemOnClick = false;

    private _highlight: HighlightModel | null = null;
    private _ghostItems: ItemData[] = [];

    private _timeline: TimelineModel;
    private _generator: Generator;

    private _tracker = new ChangeTracker();

    private _playbackPosition = 0;
    private _playbackIntervalId: number | null = null;
    private _isPlaying = false;

    private _hScrollElements: Element[] = [];
    private _vScrollElements: Element[] = [];

    private _startButton: HTMLElement | null = null;
    private _resetButton: HTMLElement | null = null;

    private _playingNotes = new Map<VoiceModel, NoteModel | undefined>();

    private _clipboard: ItemData[] = [];
    private _clipboardBeat: number | null = null;
    private _clipboardTrack: TrackModel | null = null;

    get timeline() {
        return this._timeline;
    }

    get selectedItems() {
        return this._selectedItems;
    }

    get tracker() {
        return this._tracker;
    }

    get highlight() {
        return this._highlight;
    }

    get ghostItems() {
        return this._ghostItems;
    }

    setHoveredTrack(newTrack: TrackModel | null) {
        this._hoveredTrack = newTrack;
    }

    setHoveredItem(newItem: ItemModel | null) {
        this._hoveredItem = newItem;
    }

    setHoveredHandle(newHandle: ItemHandleModel | null) {
        this._hoveredHandle = newHandle;
        this.updateCursor();
    }

    private set playbackPosition(newPosition: number) {
        this._playbackPosition = newPosition;

        const playerHead = document.getElementById("player-head")!;
        const playerBody = document.getElementById("player-body")!;

        let newPositionPx = Math.min(
            Math.round(newPosition * 64 + 1),
            this.timeline.length * 64 - 1
        );

        if (playerHead && playerBody) {
            playerHead.style.setProperty("left", newPositionPx + "px");
            playerBody.style.setProperty("left", newPositionPx + "px");
        }

        const trackDiv = playerBody.parentElement!.parentElement!;

        let minVisiblePx = trackDiv.scrollLeft;
        let maxVisiblePx = trackDiv.clientWidth + trackDiv.scrollLeft;

        if (newPositionPx < minVisiblePx || newPositionPx > maxVisiblePx) {
            for (let element of this._hScrollElements) {
                element.scrollLeft = newPositionPx - 1;
            }
        }
    }

    private get playbackPosition() {
        return this._playbackPosition;
    }

    private cutSelection() {
        this.copySelection();
        this.deleteSelection();
    }

    private copySelection() {
        if (!this._hoveredBeat || !this._hoveredTrack) return;

        this._clipboardBeat = this._hoveredBeat;
        this._clipboardTrack = this._hoveredTrack;

        if (this.highlight) {
            this._clipboard = this.highlight.tracks.flatMap((track) => {
                track.children.sort((a, b) => {
                    return a.start - b.start;
                });
                let i = track.children.findIndex((item) => {
                    return (
                        item.end > this.highlight!.start &&
                        item.end <= this.highlight!.end
                    );
                });
                let j = track.children.findLastIndex((item) => {
                    return (
                        item.start < this.highlight!.end &&
                        item.start >= this.highlight!.start
                    );
                });
                return track.children
                    .slice(i == -1 ? j : i, (j == -1 ? i : j) + 1)
                    .map((item) => {
                        const data = clone(item.data);

                        data.start = Math.max(
                            this.highlight!.start,
                            item.start
                        );
                        data.end = Math.min(this.highlight!.end, item.end);

                        return data;
                    });
            });
        }
    }

    private pasteSelection() {
        if (
            !this._clipboardBeat ||
            !this._clipboardTrack ||
            !this._hoveredBeat ||
            !this._hoveredTrack
        )
            return;

        let itemData = this._clipboard.map((itemData) => {
            return clone(itemData);
        });

        let movedItems = this.offsetItems(
            itemData,
            this._clipboardBeat,
            this._hoveredBeat,
            this._clipboardTrack,
            this._hoveredTrack
        );

        if (movedItems.length != 0) itemData = movedItems;

        itemData.forEach((itemData) => {
            new ItemModel(itemData, this);
        });

        this._highlight = null;
        this._generator.regenerate();
        this.timeline.refresh();
    }

    private insertEmptyItems() {
        if (this.highlight) {
            this.highlight.tracks.forEach((track) => {
                new ItemModel(
                    new ItemData(
                        this.highlight!.start,
                        this.highlight!.end,
                        "",
                        track
                    ),
                    this
                );
            });

            this._highlight = null;

            this._generator.regenerate();
            this._timeline.refresh();
        }
    }

    private deleteSelection() {
        if (this.highlight) {
            this.highlight.tracks.forEach((track) => {
                track.clearInterval(this.highlight!.start, this.highlight!.end);
            });
            this._highlight = null;
        }

        this._selectedItems.forEach((item) => {
            item.parent = null;
        });

        this._selectedItems = [];

        this._generator.regenerate();
        this._timeline.refresh();
    }

    private startPlayback() {
        const BPM = 60;

        this._playbackIntervalId = window.setInterval(() => {
            this.playbackPosition = Math.min(
                this.playbackPosition + BPM / 6000,
                this.timeline.length
            );

            for (let voice of this.timeline.children) {
                if (!voice.generation) continue;

                voice.generation.then((notes) => {
                    let note = notes.find((note) => {
                        return (
                            note.start <= this.playbackPosition &&
                            note.end > this.playbackPosition
                        );
                    });

                    let currNote = this._playingNotes.get(voice);

                    if (note == currNote) return;

                    if (currNote && !currNote.isRest) {
                        let noteElement = document.getElementById(
                            `note-${currNote.id}`
                        );
                        noteElement?.classList.remove("active-note");
                    }

                    if (note && !note.isRest) {
                        playNote(
                            note.pitch,
                            ((note.end - note.start) / BPM) * 60000
                        );
                        let noteElement = document.getElementById(
                            `note-${note.id}`
                        );
                        noteElement?.classList.add("active-note");
                    }

                    this._playingNotes.set(voice, note);
                });
            }

            if (this.playbackPosition == this.timeline.length) {
                this.pausePlayback();
            }
        }, 10);

        if (this._startButton) {
            this._startButton.innerHTML = "";
            new PauseIcon({ target: this._startButton });
        }

        this._isPlaying = true;
    }

    private pausePlayback() {
        if (!this._playbackIntervalId) return;

        window.clearInterval(this._playbackIntervalId);

        if (this._startButton) {
            this._startButton.innerHTML = "";
            new PlayIcon({
                target: this._startButton,
            });
        }

        this._isPlaying = false;
    }

    private resetPlayback() {
        this.pausePlayback();

        this._playingNotes.forEach((note, _) => {
            if (!note) return;
            let noteElement = document.getElementById(`note-${note.id}`);
            noteElement?.classList.remove("active-note");
        });

        this._playingNotes.clear();

        this.playbackPosition = 0;
    }

    private makeHighlight(
        fromBeat: number,
        toBeat: number,
        fromTrack: TrackModel,
        toTrack: TrackModel
    ) {
        if (fromBeat == toBeat) return;

        let tracks = this._timeline.getTracksFromTo(fromTrack, toTrack);

        if (tracks == null) return;

        let minBeat = Math.floor(Math.min(fromBeat, toBeat));
        let maxBeat = Math.ceil(Math.max(fromBeat, toBeat));

        this._highlight = new HighlightModel(minBeat, maxBeat, tracks);
    }

    private offsetItems(
        items: ItemData[],
        fromBeat: number,
        toBeat: number,
        fromTrack: TrackModel,
        toTrack: TrackModel
    ): ItemData[] {
        /* Calculate Beat Offset */

        let minBeat = items[0].start;
        let maxBeat = items[0].end;

        items.forEach((item) => {
            if (item.start < minBeat) {
                minBeat = item.start;
            } else if (item.end > maxBeat) {
                maxBeat = item.end;
            }
        });

        let beatOffset = Math.round(toBeat - fromBeat);

        beatOffset = Math.max(beatOffset, -minBeat);
        beatOffset = Math.min(beatOffset, this._timeline.length - maxBeat);

        /* Calculate Track Offset */

        let fromTrackIndex = fromTrack.getIndex()!;
        let toTrackIndex = toTrack.getIndex()!;

        let minTrackIndex = items[0].track!.getIndex()!;
        let maxTrackIndex = minTrackIndex;

        items.forEach((item) => {
            let trackIndex = item.track!.getIndex()!;

            if (trackIndex < minTrackIndex) {
                minTrackIndex = trackIndex;
            } else if (trackIndex > maxTrackIndex) {
                maxTrackIndex = trackIndex;
            }
        });

        const tracksPerVoice = 4; //IMPORTANT: Update if number of tracks per voice changes

        let trackOffset = toTrackIndex - fromTrackIndex;

        trackOffset = Math.max(trackOffset, -minTrackIndex);
        trackOffset = Math.min(trackOffset, tracksPerVoice - 1 - maxTrackIndex);

        /* Calculate Voice Offset */

        let fromVoiceIndex = fromTrack.parent!.getIndex()!;
        let toVoiceIndex = toTrack.parent!.getIndex()!;

        let minVoiceIndex = items[0].track!.parent!.getIndex()!;
        let maxVoiceIndex = minVoiceIndex;

        items.forEach((item) => {
            let voiceIndex = item.track!.parent!.getIndex()!;

            if (voiceIndex < minVoiceIndex) {
                minVoiceIndex = voiceIndex;
            } else if (voiceIndex > maxVoiceIndex) {
                maxVoiceIndex = voiceIndex;
            }
        });

        const voiceCount = this._timeline.children.length;

        let voiceOffset = toVoiceIndex - fromVoiceIndex;

        voiceOffset = Math.max(voiceOffset, -minVoiceIndex);
        voiceOffset = Math.min(voiceOffset, voiceCount - 1 - maxVoiceIndex);

        if (beatOffset != 0 || trackOffset != 0 || voiceOffset != 0) {
            return items.map((itemData) => {
                let newStart = itemData.start + beatOffset;
                let newEnd = newStart + itemData.end - itemData.start;

                let newTrackIndex = itemData.track!.getIndex()! + trackOffset;
                let newVoiceIndex =
                    itemData.track!.parent!.getIndex()! + voiceOffset;

                let newTrack =
                    this._timeline.children[newVoiceIndex].children[
                        newTrackIndex
                    ];

                return new ItemData(
                    newStart,
                    newEnd,
                    itemData.content,
                    newTrack
                );
            });
        }
        return [];
    }

    private drag() {
        if (
            this._hoveredBeat &&
            this._hoveredTrack &&
            this._clickedBeat &&
            this._clickedTrack
        ) {
            if (this._clickedHandle) {
                let oldBeat = this._clickedHandle.beat;
                let newBeat = this._clickedHandle.updateBeat(
                    Math.round(this._hoveredBeat)
                );
                if (newBeat != oldBeat) {
                    this._generator.updateUncoveredIntervals();
                    this.timeline.refresh();
                }
            } else if (this._clickedItem) {
                let itemData = this._selectedItems.map((item) => {
                    return clone(item.data);
                });

                this._ghostItems = this.offsetItems(
                    itemData,
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
            this._timeline.refresh();
        }
    }

    private updateCursor() {
        if (this._hoveredHandle || this._clickedHandle) {
            document.getElementById("app")!.style.cursor = "w-resize";
        } else if (this._clickedItem) {
            if (this._hoveredBeat != this._clickedBeat) {
                document.getElementById("app")!.style.cursor = "grabbing";
            } else {
                document.getElementById("app")!.style.cursor = "default";
            }
        } else if (this._clickedTrack && this.highlight) {
            document.getElementById("app")!.style.cursor = "crosshair";
        } else {
            document.getElementById("app")!.style.cursor = "default";
        }
    }

    constructor() {
        this._timeline = new TimelineModel(this);
        this._generator = new Generator(this._timeline);

        document.addEventListener("mousedown", (event) => {
            if (event.button != 0) return;

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
            } else {
                this._selectedItems = [];
            }
            if (this._hoveredHandle) {
                this._clickedHandle = this._hoveredHandle;
            }

            this._highlight = null;

            this._timeline.refresh();
            this.updateCursor();
        });

        document.addEventListener("mouseup", (_) => {
            if (this._ghostItems.length == 0) {
                if (!this._selectedItemOnClick) {
                    this._selectedItems = this._selectedItems.filter((item) => {
                        return item !== this._hoveredItem;
                    });
                }
            } else {
                this._selectedItems.forEach((item) => {
                    item.parent = null;
                });
                this._selectedItems = [];

                this._ghostItems.forEach((itemData) => {
                    const newItem = new ItemModel(itemData, this);
                    this.selectedItems.push(newItem);
                });
                this._ghostItems = [];

                this._generator.regenerate();
            }

            if (this._clickedHandle) {
                if (this._clickedHandle.itemL)
                    this._clickedHandle.itemL.updateHandles();

                if (this._clickedHandle.itemR)
                    this._clickedHandle.itemR.updateHandles();

                this._generator.regenerate();
            }

            if (
                this._clickedBeat &&
                this._clickedTrack &&
                !this._clickedItem &&
                !this._clickedHandle &&
                !this.highlight
            ) {
                this.playbackPosition = Math.round(this._clickedBeat);
            }

            this._clickedBeat = null;
            this._clickedTrack = null;
            this._clickedItem = null;
            this._clickedHandle = null;

            this._selectedItemOnClick = false;

            this._timeline.refresh();
            this.updateCursor();
        });

        document.addEventListener("mousemove", (event) => {
            let area = <HTMLElement>(
                document.getElementsByClassName("cursor-area")[0]
            );

            let pos = event.clientX - area.offsetLeft + area.scrollLeft;

            let beat = Math.min(Math.max(pos / 64, 0), this._timeline.length);

            this._hoveredBeat = beat;
            this.drag();

            this.updateCursor();
        });

        document.addEventListener("dblclick", (_) => {
            const app = document.getElementById("app");
            const onClose = () => {
                this._generator.regenerate();
                this._timeline.refresh();
            };
            if (this._hoveredItem && app) {
                new Popup({
                    target: app,
                    props: {
                        data: this._hoveredItem,
                        onClose: onClose,
                    },
                });
            }
        });

        onMount(() => {
            const timelineElement = document.getElementById("timeline")!;

            this._hScrollElements = [
                ...timelineElement.getElementsByClassName("h-scroll"),
            ];

            this._vScrollElements = [
                ...timelineElement.getElementsByClassName("v-scroll"),
            ];

            for (let element of this._hScrollElements) {
                element.addEventListener("wheel", (event) => {
                    let wheelEvent = <WheelEvent>event;
                    for (let element of this._hScrollElements) {
                        element.scrollLeft += wheelEvent.deltaX;
                    }
                });
            }

            for (let element of this._vScrollElements) {
                element.addEventListener("wheel", (event) => {
                    let wheelEvent = <WheelEvent>event;
                    for (let element of this._vScrollElements) {
                        element.scrollTop += wheelEvent.deltaY;
                    }
                });
            }

            this._startButton = document.getElementById("start-button");
            this._resetButton = document.getElementById("reset-button");

            this._startButton?.addEventListener("click", (_) => {
                if (this._isPlaying) {
                    this.pausePlayback();
                } else {
                    this.startPlayback();
                }
            });

            this._resetButton?.addEventListener("click", (_) => {
                this.resetPlayback();
            });
        });

        HotkeyHandler.registerHotkey("ControlLeft+KeyI", () => {
            this.insertEmptyItems();
        });

        HotkeyHandler.registerHotkey("Delete", () => {
            this.deleteSelection();
        });

        HotkeyHandler.registerHotkey("ControlLeft+KeyX", () => {
            this.cutSelection();
        });

        HotkeyHandler.registerHotkey("ControlLeft+KeyC", () => {
            this.copySelection();
        });

        HotkeyHandler.registerHotkey("ControlLeft+KeyV", () => {
            this.pasteSelection();
        });
    }
}
