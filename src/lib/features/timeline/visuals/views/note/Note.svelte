<script lang="ts">
    import type NoteVM from "../../../view_models/NoteVM";

    export let vm: NoteVM;

    vm.subscribe(() => (vm = vm));

    $: width = (vm.state.end - vm.state.start) * 64 + 2;
    $: left = vm.state.start * 64;
</script>

<div
    class="absolute z-10 h-full px-0.5"
    style="width:{width}px; left:{left}px"
    title={String(vm.state.pitch)}
>
    <div class="h-full w-full bg-black" />
</div>
