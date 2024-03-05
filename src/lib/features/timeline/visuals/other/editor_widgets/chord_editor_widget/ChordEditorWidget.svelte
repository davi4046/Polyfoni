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

<div class="flex p-2 space-x-4">
    <div>
        <p class="font-medium">Filter</p>
        <div class="flex border-2 border-gray-400 rounded-sm w-min">
            <input
                class="w-16 pl-1 border-r-2 border-gray-400"
                type="text"
                bind:value={filter}
            />
            <select class="w-4" bind:value={filter}>
                <option>None</option>
                <option>A-2743</option>
                <option>A-1243</option>
                <option>A-545</option>
            </select>
        </div>
    </div>
    <div>
        <p class="font-medium">Root</p>
        <select
            class="border-2 border-gray-400 rounded-sm"
            bind:value={value.root}
        >
            {#each pitchNames as pitch}
                <option>{pitch}</option>
            {/each}
        </select>
    </div>
    <div>
        <p class="font-medium">Decimal</p>
        <input
            class="pl-1 border-2 border-gray-400"
            type="number"
            bind:value={value.decimal}
        />
    </div>
    <div class="grid grid-flow-col gap-2 auto-cols-fr">
        {#each sortedPitchEntries as [pitch, isChecked]}
            <div>
                <div>{pitch}</div>
                <input
                    type="checkbox"
                    bind:checked={isChecked}
                    on:change={(_) => {
                        // @ts-ignore
                        value.pitches[pitch] = !isChecked;
                    }}
                />
            </div>
        {/each}
    </div>
    <div class="flex space-x-2">
        <button
            class="flex h-12 items-center space-x-1 rounded bg-gray-500 p-1.5 font-medium text-white hover:bg-gray-600"
            title="Rotate Right"
        >
            <RotateRightIcon />
        </button>
        <button
            class="flex h-12 items-center space-x-1 rounded bg-gray-500 p-1.5 font-medium text-white hover:bg-gray-600"
            title="Rotate Left"
        >
            <RotateLeftIcon />
        </button>
    </div>
</div>
