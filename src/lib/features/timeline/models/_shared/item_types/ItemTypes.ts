import type { ComponentType, SvelteComponent } from "svelte";
import Chord from "../../../_shared/chord/Chord";
import ChordEditorWidget from "../../../views/_spawned/editor_widgets/ChordEditorWidget.svelte";
import StringEditorWidget from "../../../views/_spawned/editor_widgets/StringEditorWidget.svelte";

type ItemTypes = {
    StringItem: string;
    ChordItem: Chord;
};

type EditorWidget<T extends keyof ItemTypes> = ComponentType<
    SvelteComponent<{ update: (value: ItemTypes[T]) => void }, {}, {}>
>;

const editorWidgets: { [K in keyof ItemTypes]: EditorWidget<K> } = {
    StringItem: StringEditorWidget,
    ChordItem: ChordEditorWidget,
};

export { type ItemTypes, editorWidgets };
