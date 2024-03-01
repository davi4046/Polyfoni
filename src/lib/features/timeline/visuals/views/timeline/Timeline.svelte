<script lang="ts">
    import MarkerBig from "./assets/MarkerBig.svelte";
    import MarkerSmall from "./assets/MarkerSmall.svelte";
    import Voice from "../voice/Voice.svelte";
    import VoiceHeader from "../voice_header/VoiceHeader.svelte";
    import VerticalLine from "./assets/VerticalLine.svelte";
    import type TimelineVM from "../../view_models/timeline/TimelineVM";
    import { onMount } from "svelte";

    export let timelineVM: TimelineVM;

    timelineVM.subscribe(() => (timelineVM = timelineVM));

    onMount(() => {
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

<div
    class="grid h-full grid-cols-[8rem,auto] grid-rows-[auto,auto,1fr,auto,auto]"
    on:mousemove={timelineVM.state.handleMouseMove_tracks}
    role="none"
    data-type="timeline"
    data-model-id={timelineVM.id}
>
    <!-- BUTTONS -->
    <div class="col-start-1 row-start-1"></div>
    <!-- MARKERS -->
    <div class="h-scroll col-start-2 row-start-1 h-6 overflow-hidden">
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
        class="col-start-1 row-start-2 flex h-full flex-col space-y-[var(--timeline-voice-spacing)] overflow-hidden"
        on:mousemove={timelineVM.state.handleMouseMove_others}
        role="none"
    >
        {#each timelineVM.state.top as voiceVM (voiceVM.id)}
            <VoiceHeader {voiceVM}></VoiceHeader>
        {/each}
    </div>
    <!-- CENTER HEADERS -->
    <div
        class="v-scroll col-start-1 row-start-3 flex h-full flex-col space-y-[var(--timeline-voice-spacing)] overflow-hidden"
        on:mousemove={timelineVM.state.handleMouseMove_others}
        role="none"
    >
        {#each timelineVM.state.center as voiceVM (voiceVM.id)}
            <VoiceHeader {voiceVM}></VoiceHeader>
        {/each}
    </div>
    <!-- BOTTOM HEADERS -->
    <div
        class="col-start-1 row-start-4 flex h-full flex-col space-y-[var(--timeline-voice-spacing)] overflow-hidden"
        on:mousemove={timelineVM.state.handleMouseMove_others}
        role="none"
    >
        {#each timelineVM.state.bottom as voiceVM (voiceVM.id)}
            <VoiceHeader {voiceVM}></VoiceHeader>
        {/each}
    </div>
    <!-- TOP TRACKS -->
    <div
        class="h-scroll col-start-2 row-start-2 h-full overflow-hidden"
        data-type="top"
    >
        <div
            class="flex h-full flex-col space-y-[var(--timeline-voice-spacing)] overflow-clip"
            style="width: 4096px;"
        >
            {#each timelineVM.state.top as voiceVM (voiceVM.id)}
                <Voice {voiceVM}></Voice>
            {/each}
        </div>
    </div>
    <!-- CENTER TRACKS -->
    <div
        class="h-scroll col-start-2 row-start-3 h-full overflow-hidden"
        data-type="center"
    >
        <div
            class="v-scroll flex h-full flex-col space-y-[var(--timeline-voice-spacing)] overflow-hidden"
            style="width: 4096px;"
        >
            {#each timelineVM.state.center as voiceVM (voiceVM.id)}
                <Voice {voiceVM}></Voice>
            {/each}
        </div>
    </div>
    <!-- BOTTOM TRACKS -->
    <div
        class="h-scroll col-start-2 row-start-4 h-full overflow-hidden"
        data-type="bottom"
    >
        <div
            class="flex h-full flex-col space-y-[var(--timeline-voice-spacing)] overflow-hidden"
            style="width: 4096px;"
        >
            {#each timelineVM.state.bottom as voiceVM (voiceVM.id)}
                <Voice {voiceVM}></Voice>
            {/each}
        </div>
    </div>
    <!-- SEPARATORS -->
    <div
        class="h-scroll pointer-events-none col-start-2 col-end-2 row-start-2 row-end-5 overflow-hidden"
    >
        <div
            class="relative h-full overflow-clip"
            style="width: 4096px;"
            data-type="overlay"
        >
            {#each Array(64) as _, index}
                <div
                    class="absolute h-full text-[var(--timeline-vline-color)]"
                    style="left: {index * 64 + 1}px"
                >
                    <VerticalLine />
                </div>
            {/each}
        </div>
    </div>
    <!-- EDITOR WIDGET CONTAINER -->
    <div
        data-type="editor-widget-container"
        class="col-start-1 col-end-3 row-start-5 row-end-6 bg-green-500"
        on:mousemove={timelineVM.state.handleMouseMove_others}
        role="none"
    ></div>
</div>
