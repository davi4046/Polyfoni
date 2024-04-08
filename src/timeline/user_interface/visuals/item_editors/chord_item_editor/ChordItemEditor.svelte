<script lang="ts">
    import pitchNames from "../../../../utils/pitchNames";

    import RotateLeftIcon from "./assets/RotateLeftIcon.svelte";
    import RotateRightIcon from "./assets/RotateRightIcon.svelte";
    import SpeakerIcon from "./assets/SpeakerIcon.svelte";
    import { onDestroy } from "svelte";
    import { Chord, ChordBuilder } from "../../../../models/item/Chord";
    import { invoke } from "@tauri-apps/api";
    import type { ItemTypes } from "../../../../models/item/ItemTypes";
    import { isEqual } from "lodash";

    export let value: ItemTypes["ChordItem"];
    export let update: (value: ItemTypes["ChordItem"]) => void;

    export const reflectChange = (newValue: ItemTypes["ChordItem"]) => {
        if (!isEqual(chordStatus, newValue.chordStatus)) {
            builder = new ChordBuilder(newValue.chordStatus);
        }
        if (!isEqual(value.filters, newValue.filters)) {
            filters = newValue.filters.slice();
        }

        builder.applyFilters(filters);
        builder = builder; // Reactivity hack
    };

    let builder = new ChordBuilder(value.chordStatus);
    let filters = value.filters.slice();

    $: chordStatus = builder.build();

    onDestroy(() => update({ chordStatus, filters }));

    let sortedPitchEntries: [string, boolean][];

    $: {
        const rootIndex = builder.root ? pitchNames.indexOf(builder.root) : 0;
        const pitchEntries = Object.entries(builder.pitches);

        sortedPitchEntries = [
            ...pitchEntries.slice(rootIndex),
            ...pitchEntries.slice(0, rootIndex),
        ];
    }

    let allowedPitches: string[];
    let allowedRoots: string[];

    $: {
        allowedPitches = pitchNames.filter((pitch) => {
            return filters.every((filter) => {
                return filter.isDisabled || filter.chord.pitches[pitch];
            });
        });
    }

    $: {
        if (builder.decimal) {
            allowedRoots = pitchNames
                .map((pitch) => Chord.fromDecimal(pitch, builder.decimal!)) // Create possible variations on decimal
                .filter((chord) => isAllowedChord(chord)) // Remove variations not allowed by filters
                .map((chord) => chord.root);
        } else {
            allowedRoots = allowedPitches;
        }
    }

    function isAllowedChord(chord: Chord): boolean {
        return Object.entries(chord.pitches).every(([pitch, value]) => {
            return allowedPitches.includes(pitch) || !value;
        });
    }

    function isAllowedDecimal(decimal: number): boolean {
        if (!builder.root) return false;
        return isAllowedChord(Chord.fromDecimal(builder.root, decimal));
    }

    function updateDecimal(decimal: number) {
        const startValue = builder.decimal ? builder.decimal : 0;

        if (decimal === startValue) return;

        const isIncrement = decimal > startValue;

        if (decimal % 2 === 0) decimal += isIncrement ? 1 : -1; // Ensure that decimal is uneven

        while (decimal >= 4096) decimal -= 4096;
        while (decimal < 0) decimal += 4096;

        while (!isAllowedDecimal(decimal)) {
            decimal += isIncrement ? 2 : -2;
            while (decimal >= 4096) decimal -= 4096;
            while (decimal < 0) decimal += 4096;
            if (decimal === startValue) return; // No new decimal was found
        }

        builder.decimal = decimal;
        builder = builder; // Reactivity hack
    }

    let playbackTimeout: NodeJS.Timeout;

    function playMidiValuesConcurrently(midiValues: number[]) {
        clearTimeout(playbackTimeout);

        invoke("midi_control_change", { channel: 0, control: 120, value: 0 }); // All sound off

        midiValues.forEach((midiValue) => {
            invoke("midi_note_on", {
                channel: 0,
                key: midiValue + 60,
                vel: 100,
            });
        });

        playbackTimeout = setTimeout(() => {
            invoke("midi_control_change", {
                channel: 0,
                control: 123,
                value: 0,
            }); // All notes off
        }, 2000);
    }

    function playMidiValuesSequentially(midiValues: number[]) {
        clearTimeout(playbackTimeout);

        invoke("midi_control_change", { channel: 0, control: 120, value: 0 }); // All sound off

        function playNextNote() {
            invoke("midi_note_on", {
                channel: 0,
                key: midiValues.shift()! + 60,
                vel: 100,
            });
            playbackTimeout = setTimeout(() => {
                invoke("midi_control_change", {
                    channel: 0,
                    control: 123,
                    value: 0,
                }); // All notes off
                if (midiValues.length > 0) playNextNote();
            }, 500);
        }
        playNextNote();
    }
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
                    builder.rotateOnce("L");
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
                    builder.rotateOnce("R");
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
                title="Play as Chord"
                on:click={(_) => {
                    if (!(chordStatus instanceof Chord)) return;
                    const midiValues = chordStatus.getMidiValues();
                    playMidiValuesConcurrently(midiValues);
                }}
            >
                <div class="h-5">
                    <SpeakerIcon />
                </div>
            </button>
            <button
                class="btn-default flex place-items-center space-x-0.5 p-1 font-medium"
                title="Play as Scale"
                on:click={(_) => {
                    if (!(chordStatus instanceof Chord)) return;
                    const midiValues = chordStatus.getMidiValues();
                    midiValues.sort((a, b) => a - b); // Put root first
                    playMidiValuesSequentially(midiValues);
                }}
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
                {#each allowedRoots as pitch}
                    <option>{pitch}</option>
                {/each}
            </select>
            <div class="text-sm font-medium">Decimal</div>
            <input
                class="w-24 bg-gray-200 p-2 text-xl font-medium"
                type="number"
                title="Decimal"
                value={builder.decimal ? builder.decimal : 0}
                on:change={(e) => {
                    // @ts-ignore
                    updateDecimal(Number(e.target.value));
                }}
            />
            <div class="text-sm font-medium">Pitches</div>
            <div class="flex place-items-center gap-1">
                {#each sortedPitchEntries as [pitch, value]}
                    {#if allowedPitches.includes(pitch)}
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
                    {/if}
                {/each}
            </div>
        </div>
    </div>
    {#if chordStatus instanceof Chord}
        <div
            class="w-42 flex flex-col items-center justify-center border-l-2 border-black px-4 xl:w-72"
            style="background-color:{chordStatus.getColor()};"
        >
            <div class="text-4xl">
                {chordStatus.getName()}
            </div>
            <!-- test -->
            <div>★{chordStatus.getPrimeForm().getName()}</div>
        </div>
    {/if}
</div>
