<script lang="ts">
    import pitchNames from "../../../../utils/pitchNames";

    import RotateLeftIcon from "./assets/RotateLeftIcon.svelte";
    import RotateRightIcon from "./assets/RotateRightIcon.svelte";
    import SpeakerIcon from "./assets/SpeakerIcon.svelte";
    import type Item from "../../../../models/Item";
    import { cloneDeep } from "lodash";
    import { onDestroy } from "svelte";

    export let item: Item<"ChordItem">;

    let sortedPitchEntries: [string, boolean][];

    let builder = cloneDeep(item.state.content);

    $: {
        const pitchEntries = Object.entries(builder.pitches);

        const rootIndex = builder.root ? pitchNames.indexOf(builder.root) : 0;

        sortedPitchEntries = [
            ...pitchEntries.slice(rootIndex),
            ...pitchEntries.slice(0, rootIndex),
        ];
    }

    onDestroy(() => {
        item.state = {
            content: builder,
        };
    });
</script>

<div class="grid grid-cols-[1fr,auto] border-t-2 border-black">
    <div class="flex space-x-2 overflow-x-auto p-2">
        <div
            class="grid min-w-fit auto-cols-fr grid-flow-col grid-rows-2 gap-1"
        >
            <button
                class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
                title="Rotate Left"
                on:click={(_) => {
                    builder.rotate("L");
                    builder = builder; // Reactivity hack
                }}
                disabled={builder.root === undefined}
            >
                <div class="h-5">
                    <RotateLeftIcon />
                </div>
            </button>
            <button
                class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
                title="Rotate Right"
                on:click={(_) => {
                    builder.rotate("R");
                    builder = builder; // Reactivity hack
                }}
                disabled={builder.root === undefined}
            >
                <div class="h-5">
                    <RotateRightIcon />
                </div>
            </button>
            <button
                class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
                title="Listen as Chord"
                disabled={builder.result === undefined}
            >
                <div class="h-5">
                    <SpeakerIcon />
                </div>
            </button>
            <button
                class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
                title="Listen as Scale"
                disabled={builder.result === undefined}
            >
                <div class="h-5">
                    <SpeakerIcon />
                </div>
            </button>
        </div>
        <div
            class="grid auto-cols-min grid-flow-col grid-rows-[min-content,auto] gap-x-2"
        >
            <div class="text-sm font-medium">Root</div>
            <select
                class="w-24 bg-gray-200 p-2 text-xl font-medium"
                title="Root"
                bind:value={builder.root}
            >
                <option value={undefined}>---</option>
                {#each pitchNames as pitch}
                    <option>{pitch}</option>
                {/each}
            </select>
            <div class="text-sm font-medium">Decimal</div>
            <input
                class="w-24 bg-gray-200 p-2 text-xl font-medium"
                type="number"
                title="Decimal"
                bind:value={builder.decimal}
            />
            <div class="text-sm font-medium">Pitches</div>
            <div class="flex place-items-center gap-1">
                {#each sortedPitchEntries as [pitch, isChecked]}
                    <button
                        class="adjust-width-to-height h-full rounded-full text-xl font-medium hover:brightness-105 {isChecked
                            ? 'bg-gray-300'
                            : 'opacity-50'}"
                        on:click={(_) => {
                            // @ts-ignore
                            builder.pitches[pitch] = !isChecked;
                        }}>{pitch}</button
                    >
                {/each}
            </div>
        </div>
    </div>
    <div
        class="w-42 flex flex-col items-center justify-center border-l-2 border-black bg-green-400 px-4 xl:w-72"
    >
        {#if builder.result}
            <div class="text-4xl">
                {builder.result.name}
            </div>
            <!-- test -->
            <div>★A-2741</div>
        {:else}
            <div class="text-4xl">???</div>
        {/if}
    </div>
</div>
