<script lang="ts">
    import TimelineVM from "../../../view_models/TimelineVM";
    import { onMount } from "svelte";
    import MarkerBig from "./assets/MarkerBig.svelte";
    import MarkerSmall from "./assets/MarkerSmall.svelte";
    import VerticalLine from "./assets/VerticalLine.svelte";
    import PlayIcon from "./assets/icons/PlayIcon.svelte";
    import PauseIcon from "./assets/icons/PauseIcon.svelte";
    import StopIcon from "./assets/icons/StopIcon.svelte";
    import { writable } from "svelte/store";
    import ArrowDown from "./assets/ArrowDown.svelte";
    import DynamicComponent from "../../utils/DynamicComponent.svelte";
    import VoiceGroupHeader from "../voicegroup_header/VoiceGroupHeader.svelte";
    import VoiceGroup from "../voicegroup/VoiceGroup.svelte";
    import AddIcon from "./assets/icons/AddIcon.svelte";

    export let vm: TimelineVM;

    let hScrollElements: HTMLCollectionOf<Element>;
    let vScrollElememts: HTMLCollectionOf<Element>;

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

    vm.subscribe((oldState) => {
        vm = vm;

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
                    element.scrollLeft += wheelEvent.shiftKey
                        ? wheelEvent.deltaY
                        : wheelEvent.deltaX;
                }
            });
        }
        for (const element of vScrollElememts) {
            element.addEventListener("wheel", (event) => {
                const wheelEvent = event as WheelEvent;
                for (const element of vScrollElememts) {
                    element.scrollTop += wheelEvent.shiftKey
                        ? wheelEvent.deltaX
                        : wheelEvent.deltaY;
                }
            });
        }

        updatePlaybackPosition();
    });

    let hScroll = 0;
    let vScroll = 0;

    setInterval(() => {
        for (const element of hScrollElements) {
            element.scrollLeft += hScroll;
        }
        for (const element of vScrollElememts) {
            element.scrollTop += vScroll;
        }
    }, 10);

    function updateHScroll(
        event: MouseEvent & {
            currentTarget: EventTarget & HTMLElement;
        }
    ) {
        const hPercent =
            (event.clientX - event.currentTarget.offsetLeft) /
            event.currentTarget.offsetWidth;

        hScroll = calculateScrollSpeed(
            hPercent,
            64 / event.currentTarget.offsetWidth
        );
    }

    function updateVScroll(
        event: MouseEvent & {
            currentTarget: EventTarget & HTMLElement;
        }
    ) {
        const vPercent =
            (event.clientY - event.currentTarget.offsetTop) /
            event.currentTarget.offsetHeight;

        vScroll = calculateScrollSpeed(
            vPercent,
            64 / event.currentTarget.offsetHeight
        );
    }

    function calculateScrollSpeed(percent: number, tolerance: number) {
        const maxSpeed = 10;

        if (percent <= tolerance) {
            const factor = (tolerance - percent) * (1 / tolerance);

            return -maxSpeed * factor;
        }
        if (percent >= 1 - tolerance) {
            const factor = (tolerance - 1 + percent) * (1 / tolerance);

            return maxSpeed * factor;
        }
        return 0;
    }
</script>

<div
    class="grid h-full grid-cols-[auto,auto] grid-rows-[auto,auto,1fr,auto,auto]"
    on:mousemove={vm.state.handleMouseMove_tracks}
    role="none"
>
    <!-- PLAYBACK INDICATOR -->
    <div
        class="h-scroll pointer-events-none col-start-2 row-span-3 row-start-2 h-full overflow-hidden"
    >
        <div
            class="relative z-40 h-full overflow-clip"
            style="width: {vm.state.length * 64}px;"
        >
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
        <div
            class="relative h-full overflow-clip"
            style="width: {vm.state.length * 64}px;"
        >
            {#each Array(vm.state.length) as _, index}
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
        class="col-start-1 row-start-2 h-full overflow-hidden"
        on:mousemove={vm.state.handleMouseMove}
        role="none"
    >
        <VoiceGroupHeader vm={vm.state.top}></VoiceGroupHeader>
    </div>
    <!-- CENTER HEADERS -->
    <div
        class="v-scroll col-start-1 row-start-3 h-full overflow-hidden py-4"
        on:mousemove={vm.state.handleMouseMove}
        role="none"
    >
        <VoiceGroupHeader vm={vm.state.center}></VoiceGroupHeader>
        <div class="z-20 mt-4 h-12">
            <button
                class="flex h-full w-full items-center justify-center bg-gray-300 text-gray-500 hover:brightness-105 active:brightness-100"
                title="Add Voice"
                on:click={vm.state.onAddVoiceButtonClick}
            >
                <div class="h-full">
                    <AddIcon />
                </div>
            </button>
        </div>
    </div>
    <!-- BOTTOM HEADERS -->
    <div
        class="col-start-1 row-start-4 h-full overflow-hidden"
        on:mousemove={vm.state.handleMouseMove}
        role="none"
    >
        <VoiceGroupHeader vm={vm.state.bottom}></VoiceGroupHeader>
    </div>
    <!-- TOP TRACKS -->
    <div
        class="h-scroll col-start-2 row-start-2 h-full overflow-hidden"
        role="none"
        on:mousemove|capture={(event) => {
            if (event.buttons === 1) {
                updateHScroll(event);
            } else {
                hScroll = 0;
            }
        }}
        on:mouseleave={(_) => (hScroll = 0)}
        on:mouseup={(_) => (hScroll = 0)}
    >
        <div
            class="flex h-full flex-col gap-y-[var(--timeline-voice-gap)] overflow-clip"
            style="width: {vm.state.length * 64}px;"
        >
            <VoiceGroup vm={vm.state.top}></VoiceGroup>
        </div>
    </div>
    <!-- CENTER TRACKS -->
    <div
        class="h-scroll relative col-start-2 row-start-3 h-full overflow-hidden"
        id={vm.state.idPrefix + "-center-tracks"}
        role="none"
        bind:this={centerDiv}
        on:mousemove|capture={(event) => {
            if (event.buttons === 1) {
                updateHScroll(event);
                updateVScroll(event);
            } else {
                hScroll = 0;
                vScroll = 0;
            }
        }}
        on:mouseleave={(_) => {
            hScroll = 0;
            vScroll = 0;
        }}
        on:mouseup={(_) => {
            hScroll = 0;
            vScroll = 0;
        }}
    >
        <div
            class="pointer-events-none absolute h-full bg-transparent"
            style="width: {vm.state.length * 64}px;"
            id="hejmeddig"
        >
            <!-- RESIZE BUTTONS -->
            <div
                class="pointer-events-auto absolute right-0 top-0 z-40 m-2 flex gap-2 font-mono text-sm font-bold"
            >
                <button
                    class="btn-default h-9 w-9 p-1"
                    title="Remove 64 Beats"
                    hidden={vm.state.length - 64 < 64}
                    on:mousemove={vm.state.handleMouseMove}
                    on:click={(_) =>
                        vm.state.setTimelineLength(vm.state.length - 64)}
                >
                    -64
                </button>
                <button
                    class="btn-default h-9 w-9 p-1"
                    title="Remove 16 Beats"
                    hidden={vm.state.length - 16 < 64}
                    on:mousemove={vm.state.handleMouseMove}
                    on:click={(_) =>
                        vm.state.setTimelineLength(vm.state.length - 16)}
                >
                    -16
                </button>
                <button
                    class="btn-default h-9 w-9 p-1"
                    title="Remove 4 Beats"
                    hidden={vm.state.length - 4 < 64}
                    on:mousemove={vm.state.handleMouseMove}
                    on:click={(_) =>
                        vm.state.setTimelineLength(vm.state.length - 4)}
                >
                    -4
                </button>
                <button
                    class="btn-default h-9 w-9 p-1 font-mono"
                    title="Add 4 Beats"
                    on:mousemove={vm.state.handleMouseMove}
                    on:click={(_) =>
                        vm.state.setTimelineLength(vm.state.length + 4)}
                >
                    +4
                </button>
                <button
                    title="Add 16 Beats"
                    class="btn-default h-9 w-9 p-1 font-mono"
                    on:mousemove={vm.state.handleMouseMove}
                    on:click={(_) =>
                        vm.state.setTimelineLength(vm.state.length + 16)}
                >
                    +16
                </button>
                <button
                    title="Add 64 Beats"
                    class="btn-default h-9 w-9 p-1 font-mono"
                    on:mousemove={vm.state.handleMouseMove}
                    on:click={(_) =>
                        vm.state.setTimelineLength(vm.state.length + 64)}
                >
                    +64
                </button>
            </div>
        </div>
        <div
            class="v-scroll flex h-full flex-col gap-y-[var(--timeline-voice-gap)] overflow-hidden py-4"
            style="width: {vm.state.length * 64}px;"
        >
            <VoiceGroup vm={vm.state.center}></VoiceGroup>
            <div class="z-20 h-12 flex-shrink-0" />
        </div>
    </div>
    <!-- BOTTOM TRACKS -->
    <div
        class="h-scroll col-start-2 row-start-4 h-full overflow-hidden"
        role="none"
        on:mousemove|capture={(event) => {
            if (event.buttons === 1) {
                updateHScroll(event);
            } else {
                hScroll = 0;
            }
        }}
        on:mouseleave={(_) => (hScroll = 0)}
        on:mouseup={(_) => (hScroll = 0)}
    >
        <div
            class="flex h-full flex-col space-y-[var(--timeline-voice-gap)] overflow-hidden"
            style="width: {vm.state.length * 64}px;"
        >
            <VoiceGroup vm={vm.state.bottom}></VoiceGroup>
        </div>
    </div>
    <!-- SEPARATORS -->
    <div
        class="h-scroll pointer-events-none col-start-2 col-end-2 row-start-2 row-end-5 overflow-hidden"
    >
        <div
            class="relative h-full overflow-clip"
            style="width: {vm.state.length * 64}px;"
        >
            {#each Array(vm.state.length) as _, index}
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
        role="none"
    >
        <DynamicComponent bind:createComponent={vm.state.createItemEditor} />
    </div>

    <!-- HORISONTAL SHADOWS -->

    <!-- TOP HEADERS SHADOW -->
    <div
        class="pointer-events-none bottom-0 z-20 col-start-1 row-start-2 h-1 translate-y-1 self-end bg-gradient-to-b from-black to-transparent opacity-75"
    />
    <!-- BOTTOM HEADERS SHADOW -->
    <div
        class="pointer-events-none bottom-0 z-20 col-start-1 row-start-4 h-1 -translate-y-1 bg-gradient-to-t from-black to-transparent opacity-75"
    />
    <!-- TOP TRACKS SHADOW -->
    <div
        class="pointer-events-none bottom-0 z-20 col-start-2 row-start-2 h-1 translate-y-1 self-end bg-gradient-to-b from-black to-transparent opacity-75"
    />
    <!-- BOTTOM TRACKS SHADOW -->
    <div
        class="pointer-events-none bottom-0 z-20 col-start-2 row-start-4 h-1 -translate-y-1 bg-gradient-to-t from-black to-transparent opacity-75"
    />

    <!-- VERTICAL SHADOWS -->

    <!-- TOP HEADERS SHADOW -->
    <div
        class="pointer-events-none bottom-0 z-20 col-start-2 row-start-2 h-full w-1 bg-gradient-to-r from-black to-transparent opacity-50"
    />

    <!-- CENTER HEADERS SHADOW -->
    <div
        class="pointer-events-none bottom-0 z-20 col-start-2 row-start-3 h-full w-1 bg-gradient-to-r from-black to-transparent opacity-50"
    />

    <!-- BOTTOM HEADERS SHADOW -->
    <div
        class="pointer-events-none bottom-0 z-20 col-start-2 row-start-4 h-full w-1 bg-gradient-to-r from-black to-transparent opacity-50"
    />
</div>
