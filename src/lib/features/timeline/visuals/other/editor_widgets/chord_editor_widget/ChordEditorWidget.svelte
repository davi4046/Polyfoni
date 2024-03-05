<script lang="ts">
    import type { ItemTypes } from "../../../../utils/ItemTypes";
    import type { Chord, ChordBuilder } from "../../../../utils/chord/Chord";
    import pitchNames from "../../../../utils/pitchNames";
    import RotateLeftIcon from "./assets/RotateLeftIcon.svelte";
    import RotateRightIcon from "./assets/RotateRightIcon.svelte";
    import SpeakerIcon from "./assets/SpeakerIcon.svelte";

    export let value: ItemTypes["ChordItem"];
    export let update: (value: ItemTypes["ChordItem"]) => void;

    $: pitchEntries = Object.entries(value.builder.pitches);
    $: rootIndex = value.builder.root
        ? pitchNames.indexOf(value.builder.root)
        : 0;
    $: sortedPitchEntries = [
        ...pitchEntries.slice(rootIndex),
        ...pitchEntries.slice(0, rootIndex),
    ];
</script>

<div class="flex">
    <div
        class="grid auto-cols-min grid-flow-col grid-rows-[min-content,auto] gap-x-4 p-2"
    >
        <div class="text-sm font-medium">Root</div>
        <select
            class="w-24 p-2 text-xl font-medium bg-gray-200"
            title="Root"
            bind:value={value.builder.root}
        >
            <option value={undefined}>---</option>
            {#each pitchNames as pitch}
                <option>{pitch}</option>
            {/each}
        </select>
        <div class="text-sm font-medium">Decimal</div>
        <input
            class="w-24 p-2 text-xl font-medium bg-gray-200"
            type="number"
            title="Decimal"
            bind:value={value.builder.decimal}
        />
        <div class="text-sm font-medium">Pitches</div>
        <div class="grid grid-flow-col gap-1 auto-cols-min place-items-center">
            {#each sortedPitchEntries as [pitch, isChecked]}
                <button
                    class="h-12 w-12 rounded-full text-xl font-medium hover:brightness-105 {isChecked
                        ? 'bg-gray-300'
                        : 'opacity-50'}"
                    on:click={(_) => {
                        // @ts-ignore
                        value.builder.pitches[pitch] = !isChecked;
                    }}>{pitch}</button
                >
            {/each}
        </div>
    </div>
    <div class="grid grid-flow-col grid-rows-2 gap-2 p-2 auto-cols-fr">
        <button
            class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
            on:click={(_) => {
                value.builder.rotate("L");
                value = value; // Reactivity hack
            }}
        >
            <div class="h-5">
                <RotateLeftIcon />
            </div>
            <div>Rotate Left</div>
        </button>
        <button
            class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
            on:click={(_) => {
                value.builder.rotate("R");
                value = value; // Reactivity hack
            }}
        >
            <div class="h-5">
                <RotateRightIcon />
            </div>
            <div>Rotate Right</div>
        </button>
        <button
            class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
        >
            <div class="h-5">
                <SpeakerIcon />
            </div>
            <div>Listen Chord</div>
        </button>
        <button
            class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
        >
            <div class="h-5">
                <SpeakerIcon />
            </div>
            <div>Listen Scale</div>
        </button>
    </div>
</div>
