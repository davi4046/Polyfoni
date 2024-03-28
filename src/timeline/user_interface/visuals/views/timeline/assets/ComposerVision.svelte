<script lang="ts">
    import { round } from "lodash";
    import type { NotesAnalysis } from "../../../../../features/generation/analyzeHighlights";
    import {
        getPitchName,
        getPitchOctave,
    } from "../../../../../utils/pitchNames";

    export let analysis: NotesAnalysis | undefined;

    let expandGeneral = true;
    let expandPitch = true;
    let expandDuration = true;

    function decimals(number: number): number {
        const [_, decimal] = number.toString().split(".");
        return decimal ? decimal.length : 0;
    }
</script>

{#if analysis}
    {@const range = analysis.maxPitch - analysis.minPitch + 1}
    {@const octaveRange = range / 12}
    <div
        class="absolute right-0 top-0 z-40 m-2 w-64 divide-y-2 divide-black border-2 border-black bg-white bg-opacity-75 font-mono"
    >
        <div class="col-span-2 p-2 text-xl">
            <span>ComposerVision</span><sup class="text-xs">TM</sup>
        </div>
        <details bind:open={expandGeneral}>
            <summary>General</summary>
            <div>
                <div>Notes</div>
                <div>{analysis.noteCount}</div>
            </div>
        </details>
        <details bind:open={expandPitch}>
            <summary>Pitch</summary>
            <div>
                <div>Min Pitch</div>
                <div>
                    {analysis.minPitch} ({getPitchName(analysis.minPitch) +
                        getPitchOctave(analysis.minPitch)})
                </div>
                <div>Max Pitch</div>
                <div>
                    {analysis.maxPitch} ({getPitchName(analysis.maxPitch) +
                        getPitchOctave(analysis.maxPitch)})
                </div>
                <div>Mean Pitch</div>
                <div>
                    {#if decimals(analysis.meanPitch) > 2}~{/if}{round(
                        analysis.meanPitch,
                        2
                    )}
                    ({#if decimals(analysis.meanPitch) > 0}~{/if}{getPitchName(
                        round(analysis.meanPitch)
                    ) + getPitchOctave(round(analysis.meanPitch))})
                </div>
                <div>Median Pitch</div>
                <div>
                    {#if decimals(analysis.medianPitch) > 2}~{/if}{round(
                        analysis.medianPitch,
                        2
                    )} ({#if decimals(analysis.medianPitch) > 0}~{/if}{getPitchName(
                        round(analysis.medianPitch)
                    ) + getPitchOctave(round(analysis.medianPitch))})
                </div>
                <div>Range</div>
                <div>
                    {range}
                </div>
                <div>Octave Range</div>
                <div>
                    {#if decimals(octaveRange) > 2}~{/if}{round(octaveRange, 2)}
                </div>
            </div>
        </details>
        <details bind:open={expandDuration}>
            <summary>Duration</summary>
            <div>
                <div>Min Duration</div>
                <div>
                    {#if decimals(analysis.minDuration) > 2}~{/if}{round(
                        analysis.minDuration,
                        2
                    )}
                </div>
                <div>Max Duration</div>
                <div>
                    {#if decimals(analysis.maxDuration) > 2}~{/if}{round(
                        analysis.maxDuration,
                        2
                    )}
                </div>
                <div>Mean Duration</div>
                <div>
                    {#if decimals(analysis.meanDuration) > 2}~{/if}{round(
                        analysis.meanDuration,
                        2
                    )}
                </div>
                <div>Median Duration</div>
                <div>
                    {#if decimals(analysis.medianDuration) > 2}~{/if}{round(
                        analysis.medianDuration,
                        2
                    )}
                </div>
            </div>
        </details>
    </div>
{/if}

<style>
    details {
        @apply divide-y-2 divide-black;
    }
    details > div {
        @apply grid grid-cols-[2fr,1fr] gap-x-4 gap-y-0.5 whitespace-nowrap p-2;
    }
    summary {
        @apply px-2 py-1;
    }
</style>
