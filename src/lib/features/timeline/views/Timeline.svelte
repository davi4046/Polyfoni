<script lang="ts">
    import Track from "./Track.svelte";
    import TrackHeader from "./TrackHeader.svelte";
    import MarkerBig from "./components/MarkerBig.svelte";
    import MarkerSmall from "./components/MarkerSmall.svelte";
    import VerticalLine from "./components/VerticalLine.svelte";
    import type TimelineVM from "../view_models/timeline/TimelineVM";
    import { onMount } from "svelte";

    export let timelineVM: TimelineVM;

    onMount(() => {
        // HORISONTAL SCROLLING
        for (let element of document.getElementsByClassName("h-scroll")) {
            element.addEventListener("wheel", (event) => {
                let wheelEvent = event as WheelEvent;
                for (let element of document.getElementsByClassName(
                    "h-scroll"
                )) {
                    element.scrollLeft += wheelEvent.deltaX;
                }
            });
        }
        // VERTICAL SCROLLING
        for (let element of document.getElementsByClassName("v-scroll")) {
            element.addEventListener("wheel", (event) => {
                let wheelEvent = event as WheelEvent;
                for (let element of document.getElementsByClassName(
                    "v-scroll"
                )) {
                    element.scrollTop += wheelEvent.deltaY;
                }
            });
        }
    });
</script>

<div class="h-full grid grid-cols-[auto,auto] grid-rows-[auto,auto,1fr,auto]">
    <!-- BUTTONS -->
    <div class="col-start-1 row-start-1"></div>
    <!-- MARKERS -->
    <div class="h-6 col-start-2 row-start-1 overflow-hidden h-scroll">
        <div class="relative h-full overflow-clip" style="width: 4096px;">
            {#each Array(64) as _, index}
                <div
                    class="absolute bottom-0 flex h-6 space-x-1.5"
                    style="left: {index * 64 + 1}px"
                >
                    {#if (index / 4) % 1 == 0}
                        <MarkerBig />
                        <div>{index}</div>
                    {:else}
                        <MarkerSmall />
                    {/if}
                </div>
            {/each}
        </div>
    </div>
    <!-- TOP HEADERS -->
    <div
        class="flex flex-col h-full space-y-[var(--timeline-group-spacing)] col-start-1 row-start-2 overflow-hidden"
    >
        {#each timelineVM.top as trackVMGroup}
            <div class="space-y-[var(--timeline-track-spacing)]">
                {#each trackVMGroup as trackVM}
                    <TrackHeader {trackVM}></TrackHeader>
                {/each}
            </div>
        {/each}
    </div>
    <!-- CENTER HEADERS -->
    <div
        class="flex flex-col h-full space-y-[var(--timeline-group-spacing)] col-start-1 row-start-3 overflow-hidden v-scroll"
    >
        {#each timelineVM.center as trackVMGroup}
            <div class="space-y-[var(--timeline-track-spacing)]">
                {#each trackVMGroup as trackVM}
                    <TrackHeader {trackVM}></TrackHeader>
                {/each}
            </div>
        {/each}
    </div>
    <!-- BOTTOM HEADERS -->
    <div
        class="flex flex-col h-full space-y-[var(--timeline-group-spacing)] col-start-1 row-start-4 overflow-hidden"
    >
        {#each timelineVM.bottom as trackVMGroup}
            <div class="space-y-[var(--timeline-track-spacing)]">
                {#each trackVMGroup as trackVM}
                    <TrackHeader {trackVM}></TrackHeader>
                {/each}
            </div>
        {/each}
    </div>
    <!-- TOP TRACKS -->
    <div class="h-full col-start-2 row-start-2 overflow-hidden h-scroll">
        <div
            class="flex flex-col h-full space-y-[var(--timeline-group-spacing)] overflow-clip"
            style="width: 4096px;"
        >
            {#each timelineVM.top as trackVMGroup}
                <div
                    class="space-y-[var(--timeline-track-spacing)] bg-[color:var(--timeline-group-color)]"
                >
                    {#each trackVMGroup as trackVM}
                        <Track {trackVM}></Track>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
    <!-- CENTER TRACKS -->
    <div class="h-full col-start-2 row-start-3 overflow-hidden h-scroll">
        <div
            class="flex flex-col h-full space-y-[var(--timeline-group-spacing)] overflow-hidden v-scroll"
            style="width: 4096px;"
        >
            {#each timelineVM.center as trackVMGroup}
                <div
                    class="space-y-[var(--timeline-track-spacing)] bg-[var(--timeline-group-color)]"
                >
                    {#each trackVMGroup as trackVM}
                        <Track {trackVM}></Track>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
    <!-- BOTTOM TRACKS -->
    <div class="h-full col-start-2 row-start-4 overflow-hidden h-scroll">
        <div
            class="flex flex-col h-full space-y-[var(--timeline-group-spacing)] overflow-hidden"
            style="width: 4096px;"
        >
            {#each timelineVM.bottom as trackVMGroup}
                <div
                    class="space-y-[var(--timeline-track-spacing)] bg-[color:var(--timeline-group-color)]"
                >
                    {#each trackVMGroup as trackVM}
                        <Track {trackVM}></Track>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
    <!-- SEPARATORS -->
    <div
        class="col-start-2 col-end-2 row-start-2 row-end-5 overflow-hidden pointer-events-none h-scroll"
    >
        <div class="relative h-full overflow-clip" style="width: 4096px;">
            {#each Array(64) as _, index}
                <div
                    class="absolute inset-y-0 w-0.5 bg-black"
                    style="left: {index * 64}px"
                />
            {/each}
        </div>
    </div>
</div>
