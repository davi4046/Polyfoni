<script lang="ts">
    import Note from "../note/Note.svelte";
    import type { NoteTrackVMState } from "../../../view_models/TrackVM";
    import type Model from "../../../../../architecture/Model";

    export let vm: Model<NoteTrackVMState>;

    vm.subscribe(() => (vm = vm));

    $: pitches = [...new Set(vm.state.items.map((item) => item.state.pitch))];
    $: pitches.sort((a, b) => a - b);

    $: height = 100 / pitches.length;
</script>

<div
    class="relative h-[var(--timeline-track-height)] bg-[var(--timeline-track-color)]"
    data-type="track"
    data-model-id={vm.id}
>
    {#each pitches as pitch}
        {@const notes = vm.state.items.filter((item) => {
            return item.state.pitch === pitch;
        })}
        <div class="relative" style="height:{height}%">
            {#each notes as noteVM (noteVM.id)}
                <Note vm={noteVM}></Note>
            {/each}
        </div>
    {/each}
</div>
