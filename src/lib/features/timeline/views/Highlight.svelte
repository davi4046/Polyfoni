<script lang="ts">
    import type HighlightVM from "../view_models/highlight/highlightVM";

    export let vm: HighlightVM;

    vm.subscribe(() => (vm = vm));

    $: minX = Math.min(vm.state.x1, vm.state.x2);
    $: maxX = Math.max(vm.state.x1, vm.state.x2);
    $: minY = Math.min(vm.state.y1, vm.state.y2);
    $: maxY = Math.max(vm.state.y1, vm.state.y2);
</script>

<div
    class="pointer-events-none absolute z-50 bg-blue-500 opacity-50"
    style="
    left: {minX}px;
    top: {minY}px;
    width: {maxX - minX}px;
    height: {maxY - minY}px;"
    data-model-id={vm.id}
    data-type="highlight"
/>
