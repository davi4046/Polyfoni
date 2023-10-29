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

    let trackDiv: HTMLElement;
    let headerDiv: HTMLElement;
    let markerDiv: HTMLElement;

    onMount(() => {
        trackDiv.addEventListener("wheel", (event) => {
            trackDiv.scrollLeft += event.deltaX;
            markerDiv.scrollLeft += event.deltaX;

            trackDiv.scrollTop += event.deltaY;
            headerDiv.scrollTop += event.deltaY;
        });
        headerDiv.addEventListener("wheel", (event) => {
            headerDiv.scrollTop += event.deltaY;
            trackDiv.scrollTop += event.deltaY;
        });
        markerDiv.addEventListener("wheel", (event) => {
            markerDiv.scrollLeft += event.deltaX;
            trackDiv.scrollLeft += event.deltaX;
        });
    });
</script>

<div
    class="grid grid-cols-[auto,auto] grid-rows-[auto,1fr] h-full p-4 space-x-1 bg-gray-500"
>
    <div></div>
    <div class="h-6 overflow-hidden" bind:this={markerDiv}>
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
    <div
        class="w-32 overflow-hidden relative h-full flex flex-col"
        bind:this={headerDiv}
    >
        <div class="space-y-4">
            {#each data.children as voice}
                <VoiceHeader bind:data={voice} />
            {/each}
        </div>
        <div class="bg-gray-500 pt-4 mt-auto sticky bottom-0">
            <TrackHeader data={data.output.harmonicSum} />
        </div>
    </div>
    <div class="h-full overflow-hidden" bind:this={trackDiv}>
        <div
            class="relative flex flex-col h-full"
            style="width: {data.length * 64}px"
        >
            {#each Array(data.length - 1) as _, index}
                <div
                    class="absolute top-0 z-10 h-full w-0.5 bg-gray-500"
                    style="left: {index * 64 + 64}px"
                />
            {/each}
            <div class="space-y-4">
                {#each data.children as voice}
                    <Voice bind:data={voice} />
                {/each}
            </div>
            <div class="bg-gray-500 pt-4 mt-auto sticky bottom-0">
                <Track data={data.output.harmonicSum} />
            </div>
        </div>
    </div>
</div>
