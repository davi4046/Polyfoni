import type { SvelteComponent } from "svelte";
import type StringEditorWidget from "../../views/editor_widgets/StringEditorWidget.svelte";

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
};

export type { ItemTypes as default };
