<script lang="ts">
    import Timeline from "./lib/features/timeline/views/Timeline.svelte";
    import makeDemoTimeline from "./lib/features/timeline/dev_utils/makeDemoTimeline";
    import TimelineContext from "./lib/features/timeline/contexts/TimelineContext";
    import SelectionContext from "./lib/features/timeline/contexts/SelectionContext";
    import HighlightContext from "./lib/features/timeline/contexts/HighlightContext";
    import CursorContext from "./lib/features/timeline/contexts/CursorContext";
    import createTimelineVM from "./lib/features/timeline/vm_creators/createTimelineVM";
    import MoveContext from "./lib/features/timeline/contexts/MoveContext";

    const timeline = makeDemoTimeline();

    const timelineCtx = new TimelineContext(
        timeline,
        (ctx: TimelineContext) => {
            return new HighlightContext(ctx.model);
        },
        (ctx: TimelineContext) => {
            return new SelectionContext(ctx.model);
        },
        (ctx: TimelineContext) => {
            return new CursorContext(ctx.model);
        },
        (ctx: TimelineContext) => {
            return new MoveContext(ctx.model, ctx.selection, ctx.cursor);
        }
    );

    const timelineVM = createTimelineVM(timeline, timelineCtx);
</script>

<main class="h-full">
    <Timeline {timelineVM}></Timeline>
</main>
