<script lang="ts">
    import { round } from "lodash";
    import type { NotesAnalysis } from "../../../../../features/generation/analyzeNotes";
    import {
        getPitchName,
        getPitchOctave,
    } from "../../../../../utils/pitchNames";

    export let analysis: NotesAnalysis | undefined;

    let expandGeneral = true;
    let expandPitch = true;
    let expandDuration = true;
    let expandHarmony = true;

    function decimals(number: number): number {
        const [_, decimal] = number.toString().split(".");
        return decimal ? decimal.length : 0;
    }
</script>

{#if analysis}
    {@const range = analysis.maxPitch - analysis.minPitch + 1}
    {@const octaveRange = range / 12}
    <div
        class="absolute right-0 top-0 z-40 m-2 w-72 divide-y-2 divide-gray-400 border-2 border-black text-black"
    >
        <details bind:open={expandGeneral}>
            <summary>General</summary>
            <div>
                <div>Notes</div>
                <div>{analysis.noteCount}</div>
                <div></div>
            </div>
        </details>
        <details bind:open={expandPitch}>
            <summary>Pitch</summary>
            <div>
                <div>Unique Pitches</div>
                <div>{analysis.uniquePitches}</div>
                <div></div>
                <div>Min Pitch</div>
                <div>
                    {analysis.minPitch}
                </div>
                <div>
                    ({getPitchName(analysis.minPitch) +
                        getPitchOctave(analysis.minPitch)})
                </div>
                <div>Max Pitch</div>
                <div>
                    {analysis.maxPitch}
                </div>
                <div>
                    ({getPitchName(analysis.maxPitch) +
                        getPitchOctave(analysis.maxPitch)})
                </div>
                <div>Avg. Pitch</div>
                <div>
                    {#if decimals(analysis.meanPitch) > 2}~{/if}{round(
                        analysis.meanPitch,
                        2
                    )}
                </div>
                <div>
                    ({#if decimals(analysis.meanPitch) > 0}~{/if}{getPitchName(
                        round(analysis.meanPitch)
                    ) + getPitchOctave(round(analysis.meanPitch))})
                </div>
                <div>Range</div>
                <div>
                    {range}
                </div>
                <div></div>
                <div>Octave Range</div>
                <div>
                    {#if decimals(octaveRange) > 2}~{/if}{round(octaveRange, 2)}
                </div>
                <div></div>
            </div>
        </details>
        <details bind:open={expandDuration}>
            <summary>Duration</summary>
            <div>
                <div>Avg. Duration</div>
                <div>
                    {#if decimals(analysis.meanDuration) > 2}~{/if}{round(
                        analysis.meanDuration,
                        2
                    )}
                </div>
                <div></div>
            </div>
        </details>
        <details bind:open={expandHarmony}>
            <summary>Harmony</summary>
            <div>
                <div>Chord</div>
                <div>
                    {analysis.harmony.getName()}
                </div>
                <div></div>
                <div>Prime Form ★</div>
                <div>
                    {analysis.harmony.getPrimeForm().getName()}
                </div>
                <div></div>
            </div>
        </details>
    </div>
{/if}

<style>
    summary {
        @apply relative z-50  bg-white;
    }
    details {
        @apply divide-y-2 divide-gray-400;
    }
    details > div {
        @apply grid grid-cols-[2fr,1fr,1fr] whitespace-nowrap;
    }
    details > div > div {
        @apply bg-gray-100 bg-opacity-95 p-1.5;
    }
    details > div > div:nth-child(6n + 1),
    details > div > div:nth-child(6n + 2),
    details > div > div:nth-child(6n + 3) {
        @apply bg-gray-200 bg-opacity-95;
    }
    summary {
        @apply px-2 py-1;
    }
</style>
