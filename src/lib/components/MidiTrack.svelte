<script lang="ts">
    import TrackShell from "./TrackShell.svelte";

    import type { VoiceModel } from "../models";

    export let data: VoiceModel;
</script>

<TrackShell>
    {#if data.generation}
        {#await data.generation then generation}
            {@const notes = generation.filter((note) => !note.isRest)}
            {@const uniquePitches = [
                ...new Set(notes.map((note) => note.pitch)),
            ].sort((a, b) => a - b)}
            {#each notes as note}
                {@const width = (note.end - note.start) * 64}
                {@const left = note.start * 64}
                {@const height = 100 / uniquePitches.length}
                {@const top =
                    (uniquePitches.length -
                        uniquePitches.indexOf(note.pitch) -
                        1) *
                    height}
                <div
                    class="absolute bg-green-500 z-30 border-green-600 border-r-2 border-b-2"
                    style="width:{width}px; left:{left}px; height:{height}%; top:{top}%;"
                    title={String(note.pitch)}
                ></div>
            {/each}
        {/await}
    {/if}
</TrackShell>
