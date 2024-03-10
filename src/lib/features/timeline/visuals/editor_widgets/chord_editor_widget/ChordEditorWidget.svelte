<script lang="ts">
    import pitchNames from "../../../utils/pitchNames";

    import RotateLeftIcon from "./assets/RotateLeftIcon.svelte";
    import RotateRightIcon from "./assets/RotateRightIcon.svelte";
    import SpeakerIcon from "./assets/SpeakerIcon.svelte";
    import type Item from "../../../models/Item";
    import { cloneDeep } from "lodash";
    import { onDestroy } from "svelte";

    export let item: Item<"ChordItem">;

    let builder = cloneDeep(item.state.content);

    let sortedPitchEntries: [string, boolean][];

    $: {
        const rootIndex = builder.root
            ? builder.pitches.findIndex(([pitch]) => pitch === builder.root)
            : 0;

        sortedPitchEntries = [
            ...builder.pitches.slice(rootIndex),
            ...builder.pitches.slice(0, rootIndex),
        ];
    }

    console.log("filters:", builder.filters);

    onDestroy(() => {
        item.state = {
            content: builder,
        };
    });
</script>

<div class="grid grid-cols-[1fr,auto] border-t-2 border-black">
    <div class="flex p-2 space-x-2 overflow-x-auto">
        <div
            class="grid grid-flow-col grid-rows-2 gap-1 min-w-fit auto-cols-fr"
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
                class="w-24 p-2 text-xl font-medium bg-gray-200"
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
                class="w-24 p-2 text-xl font-medium bg-gray-200"
                type="number"
                title="Decimal"
                bind:value={builder.decimal}
            />
            <div class="text-sm font-medium">Pitches</div>
            <div class="flex gap-1 place-items-center">
                {#each sortedPitchEntries as [pitch, value]}
                    <button
                        class="adjust-width-to-height h-full rounded-full text-xl font-medium hover:brightness-105 {value
                            ? 'bg-gray-300'
                            : 'opacity-50'}"
                        on:click={(_) => {
                            // @ts-ignore
                            builder.togglePitch(pitch);
                            builder = builder; // Reactivity hack
                        }}>{pitch}</button
                    >
                {/each}
            </div>
        </div>
    </div>
    <div
        class="flex flex-col items-center justify-center px-4 bg-green-400 border-l-2 border-black w-42 xl:w-72"
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
