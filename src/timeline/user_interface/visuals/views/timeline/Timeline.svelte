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
    import ArrowDown from "./assets/ArrowDown.svelte";

    export let vm: TimelineVM;

    let hScrollElements: HTMLCollectionOf<Element>;
    let vScrollElememts: HTMLCollectionOf<Element>;

    let editorWidgetContainer: HTMLElement;
    let editorWidgetComponent: SvelteComponent;

    let playbackPosition = writable(0);
    let centerDiv: HTMLElement;

    function updatePlaybackPosition() {
        const currTime = new Date().getTime();
        const currBeat = vm.state.playbackMotion.getBeatAtTime(currTime);

        const newPosition = currBeat * 64;

        if (newPosition !== $playbackPosition) {
            const minVisiblePX = centerDiv.scrollLeft;
            const maxVisiblePX = centerDiv.scrollLeft + centerDiv.clientWidth;

            if (newPosition < minVisiblePX || newPosition > maxVisiblePX) {
                for (const element of hScrollElements) {
                    element.scrollLeft = newPosition;
                }
            }
        }

        playbackPosition.set(newPosition);

        if (!vm.state.isPlaying) return;

        requestAnimationFrame(updatePlaybackPosition);
    }

    vm.subscribe((_, oldState) => {
        vm = vm;

        if (vm.state.editorWidget !== oldState.editorWidget) {
            editorWidgetComponent?.$destroy();

            if (vm.state.editorWidget) {
                editorWidgetComponent = new vm.state.editorWidget.ctor({
                    target: editorWidgetContainer,
                    props: vm.state.editorWidget.props,
                });
            }
        }

        if (!oldState.isPlaying) {
            requestAnimationFrame(updatePlaybackPosition);
        }
    });

    onMount(() => {
        hScrollElements = document.getElementsByClassName("h-scroll");
        vScrollElememts = document.getElementsByClassName("v-scroll");

        for (const element of hScrollElements) {
            element.addEventListener("wheel", (event) => {
                const wheelEvent = event as WheelEvent;
                for (const element of hScrollElements) {
                    element.scrollLeft += wheelEvent.deltaX;
                }
            });
        }
        for (const element of vScrollElememts) {
            element.addEventListener("wheel", (event) => {
                const wheelEvent = event as WheelEvent;
                for (const element of vScrollElememts) {
                    element.scrollTop += wheelEvent.deltaY;
                }
            });
        }

        updatePlaybackPosition();
    });
</script>

<div
    class="grid h-full grid-cols-[auto,auto] grid-rows-[auto,auto,1fr,auto,auto]"
    on:mousemove={vm.state.handleMouseMove_tracks}
    role="none"
    data-type="timeline"
    data-model-id={vm.id}
>
    <!-- PLAYBACK INDICATOR -->
    <div
        class="h-scroll pointer-events-none col-start-2 row-span-3 row-start-2 h-full overflow-hidden"
    >
        <div class="relative z-30 h-full overflow-clip" style="width: 4096px;">
            <div
                class="absolute h-full text-black"
                style="left: {$playbackPosition + 1}px"
            >
                <VerticalLine />
                <div
                    class="absolute top-0 h-4 w-4 -translate-x-1/2 -translate-y-2"
                >
                    <ArrowDown />
                </div>
                <div
                    class="absolute bottom-0 h-4 w-4 -translate-x-1/2 translate-y-2 rotate-180"
                >
                    <ArrowDown />
                </div>
            </div>
        </div>
    </div>
    <!-- CENTER TRACKS OVERLAY -->
    <div class="pointer-events-none relative col-start-2 row-start-3">
        <!-- PLAYBACK BUTTONS -->
        <div
            class="pointer-events-auto absolute bottom-0 right-0 z-40 m-2 flex gap-2"
        >
            <button
                class="btn-default h-9 p-1"
                title={vm.state.isPlaying ? "Pause Playback" : "Start Playback"}
                on:click={(event) => {
                    if (vm.state.isPlaying) {
                        vm.state.onPauseButtonClick(event);
                    } else {
                        vm.state.onPlayButtonClick(event);
                    }
                }}
                on:mousemove={vm.state.handleMouseMove}
            >
                {#if vm.state.isPlaying}
                    <PauseIcon />
                {:else}
                    <PlayIcon />
                {/if}
            </button>
            <button
                class="btn-default h-9 p-1"
                title="Reset Playback"
                on:click={vm.state.onStopButtonClick}
                on:mousemove={vm.state.handleMouseMove}
            >
                <StopIcon />
            </button>
        </div>
        <!-- DISPLAY HARMONY -->
        {#if vm.state.displayHarmony}
            <div class="pointer-events-auto absolute right-0 top-0 z-40 m-2">
                <div
                    class="border-2 border-black px-2 py-1 text-2xl font-medium"
                    style="background-color:{vm.state.displayHarmony.getColor()};"
                >
                    {vm.state.displayHarmony.getName()}
                </div>
            </div>
        {/if}
    </div>
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
        class="h-scroll col-start-2 row-start-2 h-full overflow-hidden"
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
        class="h-scroll col-start-2 row-start-3 h-full overflow-hidden"
        data-type="center"
        bind:this={centerDiv}
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
        class="h-scroll col-start-2 row-start-4 h-full overflow-hidden"
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
        class="col-start-1 col-end-3 row-start-5 row-end-6"
        on:mousemove={vm.state.handleMouseMove}
        bind:this={editorWidgetContainer}
        role="none"
    />
    <!-- TOP HEADERS SHADOW -->
    <div
        class="bottom-0 z-20 col-start-1 row-start-2 h-1 translate-y-1 self-end bg-gradient-to-b from-gray-800 to-transparent"
    />
    <!-- BOTTOM HEADERS SHADOW -->
    <div
        class="bottom-0 z-20 col-start-1 row-start-4 h-1 -translate-y-1 bg-gradient-to-t from-gray-800 to-transparent"
    />
    <!-- TOP TRACKS SHADOW -->
    <div
        class="bottom-0 z-20 col-start-2 row-start-2 h-1 translate-y-1 self-end bg-gradient-to-b from-gray-800 to-transparent"
    />
    <!-- BOTTOM TRACKS SHADOW -->
    <div
        class="bottom-0 z-20 col-start-2 row-start-4 h-1 -translate-y-1 bg-gradient-to-t from-gray-800 to-transparent"
    />
</div>
