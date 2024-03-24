<script lang="ts">
    import Voice from "../voice/Voice.svelte";
    import VoiceHeader from "../voice_header/VoiceHeader.svelte";
    import TimelineVM from "../../../view_models/TimelineVM";
    import { SvelteComponent, onMount } from "svelte";
    import MarkerBig from "./assets/MarkerBig.svelte";
    import MarkerSmall from "./assets/MarkerSmall.svelte";
    import VerticalLine from "./assets/VerticalLine.svelte";
    import PlayIcon from "./assets/icons/PlayIcon.svelte";
    import PauseIcon from "./assets/icons/PauseIcon.svelte";
    import StopIcon from "./assets/icons/StopIcon.svelte";
    import { writable } from "svelte/store";

    export let vm: TimelineVM;

    let editorWidgetContainer: HTMLElement;
    let editorWidgetComponent: SvelteComponent;

    let playbackPosition = writable(0);

    function updatePlaybackPosition() {
        const currTime = new Date().getTime();
        const currBeat = vm.state.playbackMotion.getBeatAtTime(currTime);
        playbackPosition.set(currBeat);
        requestAnimationFrame(updatePlaybackPosition);
    }

    updatePlaybackPosition();

    vm.subscribe((_, oldState) => {
        vm = vm;

        if (vm.state.editorWidget === oldState.editorWidget) return;

        editorWidgetComponent?.$destroy();

        if (!vm.state.editorWidget) return;

        editorWidgetComponent = new vm.state.editorWidget.ctor({
            target: editorWidgetContainer,
            props: vm.state.editorWidget.props,
        });
    });

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
    class="grid h-full grid-cols-[auto,auto] grid-rows-[auto,auto,1fr,auto,auto]"
    on:mousemove={vm.state.handleMouseMove_tracks}
    role="none"
    data-type="timeline"
    data-model-id={vm.id}
>
    <!-- PLAYBACK MARKER -->
    <div
        class="h-full col-start-2 row-span-3 row-start-2 overflow-hidden pointer-events-none h-scroll"
    >
        <div class="relative z-30 h-full overflow-clip" style="width: 4096px;">
            <div
                class="absolute h-full text-black"
                style="left: {$playbackPosition * 64 + 1}px"
            >
                <VerticalLine />
            </div>
        </div>
    </div>
    <!-- PLAYBACK BUTTONS -->
    <div class="relative col-start-2 row-start-3 pointer-events-none">
        <div
            class="absolute bottom-0 right-0 z-40 flex gap-2 m-2 pointer-events-auto"
        >
            <button
                class="p-1 btn-default h-9"
                on:click={vm.state.onPlayButtonClick}
                on:mousemove={vm.state.handleMouseMove}
            >
                <PlayIcon />
            </button>
            <button
                class="p-1 btn-default h-9"
                on:click={vm.state.onPauseButtonClick}
                on:mousemove={vm.state.handleMouseMove}
            >
                <PauseIcon />
            </button>
            <button
                class="p-1 btn-default h-9"
                on:click={vm.state.onStopButtonClick}
                on:mousemove={vm.state.handleMouseMove}
            >
                <StopIcon />
            </button>
        </div>
    </div>
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
        class="col-start-1 row-start-2 flex h-full flex-col space-y-[var(--timeline-voice-gap)] overflow-hidden"
        on:mousemove={vm.state.handleMouseMove}
        role="none"
    >
        {#each vm.state.top as voiceVM (voiceVM.id)}
            <VoiceHeader vm={voiceVM}></VoiceHeader>
        {/each}
    </div>
    <!-- CENTER HEADERS -->
    <div
        class="v-scroll col-start-1 row-start-3 flex h-full flex-col space-y-[var(--timeline-voice-gap)] overflow-hidden py-4"
        on:mousemove={vm.state.handleMouseMove}
        role="none"
    >
        {#each vm.state.center as voiceVM (voiceVM.id)}
            <VoiceHeader vm={voiceVM}></VoiceHeader>
        {/each}
    </div>
    <!-- BOTTOM HEADERS -->
    <div
        class="col-start-1 row-start-4 flex h-full flex-col space-y-[var(--timeline-voice-gap)] overflow-hidden"
        on:mousemove={vm.state.handleMouseMove}
        role="none"
    >
        {#each vm.state.bottom as voiceVM (voiceVM.id)}
            <VoiceHeader vm={voiceVM}></VoiceHeader>
        {/each}
    </div>
    <!-- TOP TRACKS -->
    <div
        class="h-full col-start-2 row-start-2 overflow-hidden h-scroll"
        data-type="top"
    >
        <div
            class="flex h-full flex-col gap-y-[var(--timeline-voice-gap)] overflow-clip"
            style="width: 4096px;"
        >
            {#each vm.state.top as voiceVM (voiceVM.id)}
                <Voice vm={voiceVM}></Voice>
            {/each}
        </div>
    </div>
    <!-- CENTER TRACKS -->
    <div
        class="h-full col-start-2 row-start-3 overflow-hidden h-scroll"
        data-type="center"
    >
        <div
            class="v-scroll flex h-full flex-col gap-y-[var(--timeline-voice-gap)] overflow-hidden py-4"
            style="width: 4096px;"
        >
            {#each vm.state.center as voiceVM (voiceVM.id)}
                <Voice vm={voiceVM}></Voice>
            {/each}
        </div>
    </div>
    <!-- BOTTOM TRACKS -->
    <div
        class="h-full col-start-2 row-start-4 overflow-hidden h-scroll"
        data-type="bottom"
    >
        <div
            class="flex h-full flex-col space-y-[var(--timeline-voice-gap)] overflow-hidden"
            style="width: 4096px;"
        >
            {#each vm.state.bottom as voiceVM (voiceVM.id)}
                <Voice vm={voiceVM}></Voice>
            {/each}
        </div>
    </div>
    <!-- SEPARATORS -->
    <div
        class="col-start-2 col-end-2 row-start-2 row-end-5 overflow-hidden pointer-events-none h-scroll"
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
        class="col-start-1 col-end-3 row-start-5 row-end-6"
        on:mousemove={vm.state.handleMouseMove}
        bind:this={editorWidgetContainer}
        role="none"
    />
    <!-- TOP HEADERS SHADOW -->
    <div
        class="bottom-0 z-20 self-end h-1 col-start-1 row-start-2 translate-y-1 bg-gradient-to-b from-gray-800 to-transparent"
    />
    <!-- BOTTOM HEADERS SHADOW -->
    <div
        class="bottom-0 z-20 h-1 col-start-1 row-start-4 -translate-y-1 bg-gradient-to-t from-gray-800 to-transparent"
    />
    <!-- TOP TRACKS SHADOW -->
    <div
        class="bottom-0 z-20 self-end h-1 col-start-2 row-start-2 translate-y-1 bg-gradient-to-b from-gray-800 to-transparent"
    />
    <!-- BOTTOM TRACKS SHADOW -->
    <div
        class="bottom-0 z-20 h-1 col-start-2 row-start-4 -translate-y-1 bg-gradient-to-t from-gray-800 to-transparent"
    />
</div>
