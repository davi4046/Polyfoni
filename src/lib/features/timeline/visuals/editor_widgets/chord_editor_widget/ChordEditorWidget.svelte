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

    builder.subscribe(() => (builder = builder));

    let sortedPitchEntries: [string, boolean][];

    $: {
        const rootIndex = builder.state.root
            ? builder.state.pitches.findIndex(
                  ([pitch]) => pitch === builder.state.root
              )
            : 0;

        sortedPitchEntries = [
            ...builder.state.pitches.slice(rootIndex),
            ...builder.state.pitches.slice(0, rootIndex),
        ];
    }

    console.log("filters:", builder.state.filters);

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
                }}
                disabled={builder.state.root === undefined}
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
                }}
                disabled={builder.state.root === undefined}
            >
                <div class="h-5">
                    <RotateRightIcon />
                </div>
            </button>
            <button
                class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
                title="Listen as Chord"
                disabled={builder.state.result === undefined}
            >
                <div class="h-5">
                    <SpeakerIcon />
                </div>
            </button>
            <button
                class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
                title="Listen as Scale"
                disabled={builder.state.result === undefined}
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
                value={builder.state.root}
                on:change={(e) => {
                    // @ts-ignore
                    builder.setRoot(e.target.value);
                }}
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
                value={builder.state.decimal}
                on:change={(e) => {
                    // @ts-ignore
                    builder.setDecimal(Number(e.target.value));
                }}
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
                        }}>{pitch}</button
                    >
                {/each}
            </div>
        </div>
    </div>
    <div
        class="flex flex-col items-center justify-center px-4 bg-green-400 border-l-2 border-black w-42 xl:w-72"
    >
        {#if builder.state.result}
            <div class="text-4xl">
                {builder.state.result.name}
            </div>
            <!-- test -->
            <div>★A-2741</div>
        {:else}
            <div class="text-4xl">???</div>
        {/if}
    </div>
</div>
