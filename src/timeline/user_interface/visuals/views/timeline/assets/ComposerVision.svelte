<script lang="ts">
    import { round } from "lodash";
    import type { NotesAnalysis } from "../../../../../features/generation/analyzeHighlights";
    import {
        getPitchName,
        getPitchOctave,
    } from "../../../../../utils/pitchNames";

    export let analysis: NotesAnalysis;

    $: fields = [
        ["Notes", analysis.noteCount],
        [
            "Min Pitch",
            `${getPitchName(analysis.minPitch)}${getPitchOctave(
                analysis.minPitch
            )} (${analysis.minPitch})`,
        ],
        [
            "Max Pitch",
            `${getPitchName(analysis.maxPitch)}${getPitchOctave(
                analysis.maxPitch
            )} (${analysis.maxPitch})`,
        ],
        ["Mean Pitch", round(analysis.meanPitch, 2)],
        ["Median Pitch", round(analysis.medianPitch, 2)],
        ["Range", analysis.maxPitch - analysis.minPitch + 1],
        [
            "Octave Range",
            round((analysis.maxPitch - analysis.minPitch + 1) / 12, 2),
        ],
        ["Min Duration", analysis.minDuration],
        ["Max Duration", analysis.maxDuration],
        ["Mean Duration", round(analysis.meanDuration, 2)],
        ["Median Duration", round(analysis.medianDuration, 2)],
    ];
</script>

<div
    class="pointer-events-auto absolute right-0 top-0 z-40 m-2 grid grid-cols-[auto,auto] gap-x-4 bg-black bg-opacity-25"
>
    <div class="col-span-2">Composer Vision™</div>
    {#each fields as field}
        <div>{field[0]}</div>
        <div>{field[1]}</div>
    {/each}
</div>
