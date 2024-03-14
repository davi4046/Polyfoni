<script lang="ts">
    import type NoteVM from "../../../view_models/NoteVM";

    export let vm: NoteVM;

    vm.subscribe(() => (vm = vm));

    $: width = (vm.state.end - vm.state.start) * 64 + 2;
    $: left = vm.state.start * 64;
</script>

<div class="absolute z-10 h-full bg-black w-[{width}px] left-[{left}px]" />
