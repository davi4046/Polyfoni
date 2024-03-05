<script lang="ts">
    import type ChordBuilder from "../../../../utils/chord/ChordBuilder";
    import pitchNames from "../../../../utils/pitchNames";
    import RotateLeftIcon from "./assets/RotateLeftIcon.svelte";
    import RotateRightIcon from "./assets/RotateRightIcon.svelte";

    export let value: ChordBuilder;
    export let update: (value: ChordBuilder) => void;

    let filter: string;

    $: pitchEntries = Object.entries(value.pitches);
    $: rootIndex = value.root ? pitchNames.indexOf(value.root) : 0;
    $: sortedPitchEntries = [
        ...pitchEntries.slice(rootIndex),
        ...pitchEntries.slice(0, rootIndex),
    ];
</script>

<div
    class="grid auto-cols-min grid-flow-col grid-rows-[min-content,auto] gap-x-4 p-2"
>
    <div class="text-sm font-medium">Root</div>
    <select
        class="w-24 p-2 text-xl font-medium bg-gray-200"
        title="Root"
        bind:value={value.root}
    >
        <option>---</option>
        {#each pitchNames as pitch}
            <option>{pitch}</option>
        {/each}
    </select>
    <div class="text-sm font-medium">Decimal</div>
    <input
        class="w-24 p-2 text-xl font-medium bg-gray-200"
        type="number"
        title="Decimal"
        bind:value={value.decimal}
    />
    <div class="text-sm font-medium">Pitches</div>
    <div class="grid grid-flow-col gap-1 auto-cols-min">
        {#each sortedPitchEntries as [pitch, isChecked]}
            <button
                class="h-12 w-12 rounded-full text-xl font-medium hover:brightness-105 {isChecked
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
