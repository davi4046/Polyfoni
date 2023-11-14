<script lang="ts">
    import Voice from "./Voice.svelte";
    import VoiceHeader from "./VoiceHeader.svelte";
    import BigMarker from "./svg/BigMarker.svelte";
    import SmallMarker from "./svg/SmallMarker.svelte";
    import PlayerHead from "./svg/PlayerHead.svelte";

    import { TimelineModel } from "../models";
    import PlayIcon from "./svg/PlayIcon.svelte";
    import ResetIcon from "./svg/ResetIcon.svelte";

    export let data: TimelineModel;
</script>

<div class="relative h-full" id="timeline">
    <div
        class="grid grid-cols-[auto,auto] grid-rows-[auto,1fr] h-full p-4 gap-x-1 bg-gray-500"
    >
        <div class="mb-2 space-x-2">
            <button class="w-8 h-8 p-2 btn btn-primary" id="start-pause-button">
                <PlayIcon />
            </button>
            <button class="w-8 h-8 p-2 btn btn-primary" id="reset-button">
                <ResetIcon />
            </button>
        </div>
        <!-- Markers -->
        <div class="h-full overflow-hidden h-scroll">
            <div class="relative h-full" style="width: {data.length * 64}px">
                {#each Array(data.length) as _, index}
                    <div
                        class="absolute flex h-6 bottom-0 space-x-1.5 text-gray-900"
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
                <div
                    class="absolute bottom-0 z-40 w-6 h-6 -translate-x-1/2 text-cyan-300"
                    id="player-head"
                >
                    <PlayerHead />
                </div>
            </div>
        </div>
        <!-- Headers -->
        <div class="relative flex flex-col w-32 h-full overflow-hidden">
            <div class="space-y-4 overflow-hidden v-scroll">
                {#each data.children as voice}
                    <VoiceHeader bind:data={voice} />
                {/each}
            </div>
        </div>
        <!-- Tracks -->
        <div class="h-full overflow-hidden h-scroll cursor-area">
            <div
                class="relative flex flex-col h-full"
                style="width: {data.length * 64}px"
            >
                <div class="relative space-y-4 overflow-hidden v-scroll">
                    {#each data.children as voice}
                        <Voice bind:data={voice} />
                    {/each}
                </div>
                <div class="absolute inset-0 z-20 pointer-events-none">
                    {#each Array(data.length - 1) as _, index}
                        <div
                            class="absolute top-0 h-full w-0.5 bg-gray-500"
                            style="left: {index * 64 + 64}px"
                        />
                    {/each}
                </div>
                <div
                    class="absolute left-0 z-40 h-full -translate-x-1/2 bg-cyan-300 w-0.5"
                    id="player-body"
                ></div>
            </div>
        </div>
    </div>
</div>
