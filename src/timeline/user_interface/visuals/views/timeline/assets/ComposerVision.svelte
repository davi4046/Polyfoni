<script lang="ts">
    import { round } from "lodash";
    import type { NotesAnalysis } from "../../../../../features/generation/analyzeHighlights";
    import {
        getPitchName,
        getPitchOctave,
    } from "../../../../../utils/pitchNames";

    export let analysis: NotesAnalysis;
</script>

<div
    class="absolute right-0 top-0 z-40 m-2 w-64 divide-y-2 divide-black border-2 border-black bg-white bg-opacity-50 font-medium"
>
    <div class="col-span-2 bg-white p-2 text-xl">
        <span>ComposerVision</span><sup class="text-xs">TM</sup>
    </div>
    <details>
        <summary>General</summary>
        <div>
            <div>Notes</div>
            <div>{analysis.noteCount}</div>
        </div>
    </details>
    <details>
        <summary>Pitch</summary>
        <div>
            <div>Min Pitch</div>
            <div>
                {getPitchName(analysis.minPitch) +
                    getPitchOctave(analysis.minPitch)} ({analysis.minPitch})
            </div>
            <div>Max Pitch</div>
            <div>
                {getPitchName(analysis.maxPitch) +
                    getPitchOctave(analysis.maxPitch)} ({analysis.maxPitch})
            </div>
            <div>Mean Pitch</div>
            <div>
                {round(analysis.meanPitch, 2)}
            </div>
            <div>Median Pitch</div>
            <div>
                {round(analysis.medianPitch, 2)}
            </div>
            <div>Range</div>
            <div>
                {analysis.maxPitch - analysis.minPitch + 1}
            </div>
            <div>Octave Range</div>
            <div>
                {round((analysis.maxPitch - analysis.minPitch + 1) / 12, 2)}
            </div>
        </div>
    </details>
    <details>
        <summary>Duration</summary>
        <div>
            <div>Min Duration</div>
            <div>
                {round(analysis.minDuration, 2)}
            </div>
            <div>Max Duration</div>
            <div>
                {round(analysis.maxDuration, 2)}
            </div>
            <div>Mean Duration</div>
            <div>
                {round(analysis.meanDuration, 2)}
            </div>
            <div>Median Duration</div>
            <div>
                {round(analysis.medianDuration, 2)}
            </div>
        </div>
    </details>
</div>

<style>
    details {
        @apply divide-y-2 divide-black;
    }
    details > div {
        @apply grid grid-cols-2 gap-x-4 gap-y-0.5 whitespace-nowrap;
    }
    details > * {
        @apply p-2;
    }
</style>
