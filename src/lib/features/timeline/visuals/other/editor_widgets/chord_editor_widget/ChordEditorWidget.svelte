<script lang="ts">
    import type { ItemTypes } from "../../../../utils/ItemTypes";
    import pitchNames from "../../../../utils/pitchNames";
    import { onDestroy } from "svelte";

    import RotateLeftIcon from "./assets/RotateLeftIcon.svelte";
    import RotateRightIcon from "./assets/RotateRightIcon.svelte";
    import SpeakerIcon from "./assets/SpeakerIcon.svelte";
    import FilterIcon from "./assets/FilterIcon.svelte";
    import AddIcon from "./assets/AddIcon.svelte";
    import FilterOffIcon from "./assets/FilterOffIcon.svelte";

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

    onDestroy(() => update(value));
</script>

<div class="flex p-2 space-x-2">
    <div class="grid grid-flow-col grid-rows-2 gap-1 auto-cols-fr">
        <button
            class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
            title="Rotate Left"
            on:click={(_) => {
                value.builder.rotate("L");
                value = value; // Reactivity hack
            }}
        >
            <div class="h-5">
                <RotateLeftIcon />
            </div>
        </button>
        <button
            class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
            title="Rotate Right"
            on:click={(_) => {
                value.builder.rotate("R");
                value = value; // Reactivity hack
            }}
        >
            <div class="h-5">
                <RotateRightIcon />
            </div>
        </button>
        <button
            class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
            title="Create Filter"
        >
            <div class="h-5">
                <AddIcon />
            </div>
        </button>
        <button
            class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
            title="Remove Filter"
        >
            <div class="h-5">
                <FilterOffIcon />
            </div>
        </button>
        <button
            class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
            title="Listen as Chord"
        >
            <div class="h-5">
                <SpeakerIcon />
            </div>
        </button>
        <button
            class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
            title="Listen as Scale"
        >
            <div class="h-5">
                <SpeakerIcon />
            </div>
        </button>
    </div>
    <div
        class="grid auto-cols-min grid-flow-col grid-rows-[min-content,auto] gap-x-2"
    >
        <div class="flex text-sm font-medium">
            Filter
            <div><FilterIcon /></div>
        </div>
        <select class="w-24 p-2 text-xl font-medium bg-gray-200" title="Filter">
            <option value={undefined}>---</option>
        </select>
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
        <div class="flex gap-1 place-items-center">
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
</div>
