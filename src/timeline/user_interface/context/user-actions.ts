import { emit } from "@tauri-apps/api/event";

import type TimelineContext from "./TimelineContext";

import copyHighlightedItems from "./operations/copyHighlightedItems";
import copySelectedItems from "./operations/copySelectedItems";
import cropHighlightedItems from "./operations/cropHighlightedItems";
import deleteSelectedItems from "./operations/deleteSelectedItems";
import insertEmptyItems from "./operations/insertEmptyItems";
import pasteClipboard from "./operations/pasteClipboard";
import selectHighlightedItems from "./operations/selectHighlightedItems";

export function createItems(context: TimelineContext) {
    context.history.startAction();

    const newItems = insertEmptyItems(context);

    context.history.endAction(
        newItems.length > 1
            ? `Created ${newItems.length} items`
            : `Created item`
    );
}

export function selectItems(context: TimelineContext) {
    selectHighlightedItems(context);
}

export function cutItems(context: TimelineContext) {
    context.history.startAction();

    if (context.state.highlights.length > 0) {
        copyHighlightedItems(context);
        cropHighlightedItems(context);
    } else {
        copySelectedItems(context);
        deleteSelectedItems(context);
    }

    context.history.endAction("Cut selection");
}

export function copyItems(context: TimelineContext) {
    if (context.state.highlights.length > 0) {
        copyHighlightedItems(context);
    } else {
        copySelectedItems(context);
    }
    emit("display-message", {
        message: "Copied selection to clipbaord",
    });
}

export function pasteItems(context: TimelineContext) {
    pasteClipboard(context);
}

export function undoAction(context: TimelineContext) {
    context.history.undoAction();
}

export function redoAction(context: TimelineContext) {
    context.history.redoAction();
}
