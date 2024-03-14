<script lang="ts">
    import Note from "../note/Note.svelte";
    import type { NoteTrackVMState } from "../../../view_models/TrackVM";
    import type Model from "../../../../../architecture/Model";

    export let vm: Model<NoteTrackVMState>;

    vm.subscribe(() => (vm = vm));
</script>

<div
    class="relative h-[var(--timeline-track-height)] bg-[var(--timeline-track-color)]"
    data-type="track"
    data-model-id={vm.id}
>
    {#each vm.state.items as noteVM (noteVM.id)}
        <Note vm={noteVM}></Note>
    {/each}
</div>
