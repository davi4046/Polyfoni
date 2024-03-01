import type { SvelteComponent } from "svelte";

import type Item from "./../../models/Item";
import Timeline from "./../../models/Timeline";
import { editorWidgets } from "./../../utils/ItemTypes";
import type { ItemTypes } from "./../../utils/ItemTypes";
import Attribute from "./../../../../shared/architecture/AttributeEnum";
import { getGrandparent } from "../../../../shared/architecture/state-hierarchy-utils";

class EditorWidgetManager {
    constructor(timeline: Timeline) {
        this._timeline = timeline;
    }

    private _timeline: Timeline;
    private _editorWidget?: SvelteComponent;

    openItemEditorWidget<T extends keyof ItemTypes>(item: Item<T>) {
        if (getGrandparent(getGrandparent(item)) !== this._timeline) {
            throw new Error("Item must be on this timeline");
        }

        this.closeEditorWigdet();

        const editorWidgetContainer = document
            .querySelector(`[${Attribute.ModelId}='${this._timeline.id}']`)!
            .querySelector(`[${Attribute.Type}='editor-widget-container']`)!;

        this._editorWidget = new editorWidgets[item.itemType]({
            target: editorWidgetContainer,
            props: {
                value: item.state.content,
                update: (value) => {
                    item.state = { content: value };
                },
            },
        });
    }

    closeEditorWigdet() {
        this._editorWidget?.$destroy();
        this._editorWidget = undefined;
    }
}

export default EditorWidgetManager;
