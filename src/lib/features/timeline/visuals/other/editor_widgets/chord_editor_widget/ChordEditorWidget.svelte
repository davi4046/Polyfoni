<script lang="ts">
    import type { ItemTypes } from "../../../../utils/ItemTypes";
    import pitchNames from "../../../../utils/pitchNames";
    import { onDestroy } from "svelte";

    import RotateLeftIcon from "./assets/RotateLeftIcon.svelte";
    import RotateRightIcon from "./assets/RotateRightIcon.svelte";
    import SpeakerIcon from "./assets/SpeakerIcon.svelte";

    export let value: ItemTypes["ChordItem"];
    export let update: (value: ItemTypes["ChordItem"]) => void;

    let sortedPitchEntries: [string, boolean][];

    $: {
        const pitchEntries = Object.entries(value.pitches);

        const rootIndex = value.root ? pitchNames.indexOf(value.root) : 0;

        sortedPitchEntries = [
            ...pitchEntries.slice(rootIndex),
            ...pitchEntries.slice(0, rootIndex),
        ];
    }

    onDestroy(() => update(value));
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
                    value.rotate("L");
                    value = value; // Reactivity hack
                }}
                disabled={value.root === undefined}
            >
                <div class="h-5">
                    <RotateLeftIcon />
                </div>
            </button>
            <button
                class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
                title="Rotate Right"
                on:click={(_) => {
                    value.rotate("R");
                    value = value; // Reactivity hack
                }}
                disabled={value.root === undefined}
            >
                <div class="h-5">
                    <RotateRightIcon />
                </div>
            </button>
            <button
                class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
                title="Listen as Chord"
                disabled={value.result === undefined}
            >
                <div class="h-5">
                    <SpeakerIcon />
                </div>
            </button>
            <button
                class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
                title="Listen as Scale"
                disabled={value.result === undefined}
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
                bind:value={value.root}
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
                bind:value={value.decimal}
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
                            value.pitches[pitch] = !isChecked;
                        }}>{pitch}</button
                    >
                {/each}
            </div>
        </div>
    </div>
    <div
        class="w-42 flex flex-col items-center justify-center border-l-2 border-black bg-green-400 px-4 xl:w-72"
    >
        {#if value.result}
            <div class="text-4xl">
                {value.result.name}
            </div>
            <!-- test -->
            <div>★A-2741</div>
        {:else}
            <div class="text-4xl">???</div>
        {/if}
    </div>
</div>
