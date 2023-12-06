import Context from "../../../shared/context/Context";

import type Timeline from "../models/timeline/Timeline";
import type CursorContext from "./CursorContext";
import type HighlightContext from "./HighlightContext";
import type MoveContext from "./MoveContext";
import type SelectionContext from "./SelectionContext";

type Constructor<T> = (ctx: TimelineContext) => T;

class TimelineContext extends Context<Timeline> {
    readonly highlight: HighlightContext;
    readonly selection: SelectionContext;
    readonly cursor: CursorContext;
    readonly move: MoveContext;

    constructor(
        timeline: Timeline,
        highlightCtor: Constructor<HighlightContext>,
        selectionCtor: Constructor<SelectionContext>,
        cursorCtor: Constructor<CursorContext>,
        moveCtor: Constructor<MoveContext>
    ) {
        super(timeline);
        this.highlight = highlightCtor(this);
        this.selection = selectionCtor(this);
        this.cursor = cursorCtor(this);
        this.move = moveCtor(this);
    }
}

export default TimelineContext;
