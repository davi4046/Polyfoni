<script lang="ts">
    import Voice from "./Voice.svelte";
    import VoiceHeader from "./VoiceHeader.svelte";
    import BigMarker from "./svg/BigMarker.svelte";
    import SmallMarker from "./svg/SmallMarker.svelte";
    import Track from "./Track.svelte";
    import TrackHeader from "./TrackHeader.svelte";

    import { TimelineModel } from "../models";
    import { onMount } from "svelte";

    export let data: TimelineModel;

    onMount(() => {
        let hScroll = document.getElementsByClassName("h-scroll");
        let vScroll = document.getElementsByClassName("v-scroll");

        for (let element of hScroll) {
            element.addEventListener("wheel", (event) => {
                console.log("horizontal scroll");
                let wheelEvent = <WheelEvent>event;
                for (let element of hScroll) {
                    element.scrollLeft += wheelEvent.deltaX;
                }
            });
        }
        for (let element of vScroll) {
            element.addEventListener("wheel", (event) => {
                console.log("vertical scroll");
                let wheelEvent = <WheelEvent>event;
                for (let element of vScroll) {
                    element.scrollTop += wheelEvent.deltaY;
                }
            });
        }
    });
</script>

<div class="relative h-full" id="timeline">
    <div
        class="grid grid-cols-[auto,auto] grid-rows-[auto,1fr] h-full p-4 space-x-1 bg-gray-500"
    >
        <div></div>
        <!-- Markers -->
        <div class="h-6 overflow-hidden h-scroll">
            <div class="relative" style="width: {data.length * 64}px">
                {#each Array(data.length) as _, index}
                    <div
                        class="absolute flex h-6 space-x-1.5 text-gray-900"
                        style="left: {index * 64 + 1}px"
                    >
                        {#if (index / 4) % 1 == 0}
                            <BigMarker />
                            <p class="font-semibold">{index / 4}</p>
                        {:else}
                            <SmallMarker />
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
        <!-- Headers -->
        <div class="relative flex flex-col w-32 h-full overflow-hidden">
            <div class="z-10 mb-4 space-y-2">
                <TrackHeader data={data.meterTrack} />
                <TrackHeader data={data.tempoTrack} />
            </div>
            <div class="mb-4 space-y-4 overflow-hidden v-scroll">
                {#each data.children as voice}
                    <VoiceHeader bind:data={voice} />
                {/each}
            </div>
            <div class="z-10 mt-auto">
                <TrackHeader data={data.output.harmonicSum} />
            </div>
        </div>
        <!-- Tracks -->
        <div class="h-full overflow-hidden h-scroll cursor-area">
            <div
                class="relative flex flex-col h-full"
                style="width: {data.length * 64}px"
            >
                <div class="z-10 mb-4 space-y-2">
                    <Track data={data.meterTrack} />
                    <Track data={data.tempoTrack} />
                </div>
                <div class="relative mb-4 space-y-4 overflow-hidden v-scroll">
                    {#each data.children as voice}
                        <Voice bind:data={voice} />
                    {/each}
                </div>
                <div class="z-10 mt-auto">
                    <Track data={data.output.harmonicSum} />
                </div>
                <div class="absolute inset-0 z-20 pointer-events-none">
                    {#each Array(data.length - 1) as _, index}
                        <div
                            class="absolute top-0 h-full w-0.5 bg-gray-500"
                            style="left: {index * 64 + 64}px"
                        />
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
