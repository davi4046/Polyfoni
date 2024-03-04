<script lang="ts">
    import type ChordBuilder from "../../../utils/chord/ChordBuilder";
    import pitchNames from "../../../utils/pitchNames";

    export let value: ChordBuilder;
    export let update: (value: ChordBuilder) => void;

    let filter: string;
</script>

<div class="flex space-x-4 p-2">
    <div>
        <p class="font-medium">Filter</p>
        <div class="flex w-min rounded-sm border-2 border-gray-400">
            <input
                class="w-16 border-r-2 border-gray-400 pl-1"
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
            class="rounded-sm border-2 border-gray-400"
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
            class="border-2 border-gray-400 pl-1"
            type="text"
            bind:value={value.decimal}
        />
    </div>
    <div class="grid auto-cols-fr grid-flow-col gap-2">
        {#each Object.entries(value.pitches) as [pitch, checked]}
            <div>
                <div>{pitch}</div>
                <input
                    type="checkbox"
                    bind:checked
                    on:change={(_) => {
                        // @ts-ignore
                        value.pitches[pitch] = !checked;
                    }}
                />
            </div>
        {/each}
    </div>
    <div>
        <button>Play</button>
    </div>
</div>
