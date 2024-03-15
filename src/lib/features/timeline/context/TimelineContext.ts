import type { SvelteComponent } from "svelte";

import type Highlight from "../models/Highlight";
import type Item from "../models/Item";
import type Timeline from "../models/Timeline";
import { editorWidgets, type ItemTypes } from "../utils/ItemTypes";
import Attribute from "../../../architecture/AttributeEnum";
import Stateful from "../../../architecture/Stateful";

interface TimelineContextState {
    editItem?: Item<any>;
    highlights: Highlight[];
    ghostPairs: [Item<any>, Item<any>][];
    selectedItems: Item<any>[];
}

export default class TimelineContext extends Stateful<TimelineContextState> {
    constructor(readonly timeline: Timeline) {
        super({
            highlights: [],
            ghostPairs: [],
            selectedItems: [],
        });

        let editorWidget: SvelteComponent | undefined;

        this.subscribe((_, oldState) => {
            if (this.state.editItem === oldState.editItem) return;

            editorWidget?.$destroy();

            if (!this.state.editItem) return;

            const EditorWidgetCtor =
                editorWidgets[this.state.editItem.itemType as keyof ItemTypes];

            if (!EditorWidgetCtor) return;

            const editorWidgetContainer = document
                .querySelector(`[${Attribute.ModelId}='${timeline.id}']`)!
                .querySelector(
                    `[${Attribute.Type}='editor-widget-container']`
                )!;

            editorWidget = new EditorWidgetCtor({
                target: editorWidgetContainer,
                // @ts-ignore
                props: { item: this.state.editItem },
            });
        });
    }
}
