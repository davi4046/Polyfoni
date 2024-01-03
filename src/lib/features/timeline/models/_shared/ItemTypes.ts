import type { SvelteComponent } from "svelte";
import type StringEditorWidget from "../../views/editor_widgets/StringEditorWidget.svelte";
import Chord from "../../utils/chord/Chord";

import type ChordEditorWidget from "../../views/editor_widgets/ChordEditorWidget.svelte";

type ItemType<
    TContent,
    TEditorWidget extends SvelteComponent<
        { update: (value: TContent) => void },
        {},
        {}
    >,
> = {
    ContentType: TContent;
    EditorWidgetType: TEditorWidget;
};

type ItemTypes = {
    StringItem: ItemType<string, StringEditorWidget>;
    ChordItem: ItemType<Chord, ChordEditorWidget>;
};

export type { ItemTypes as default };
