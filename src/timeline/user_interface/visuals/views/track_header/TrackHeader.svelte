<script lang="ts">
    import type TrackVM from "../../../view_models/TrackVM";
    import DynamicComponent from "../../utils/DynamicComponent.svelte";

    export let vm: TrackVM;

    vm.subscribe(() => (vm = vm));
</script>

<div
    class="flex h-[var(--timeline-track-height)] w-full items-center whitespace-nowrap p-2"
>
    <div class="mr-2 h-6 w-6 overflow-clip">
        <DynamicComponent createComponent={vm.state.createIcon} />
    </div>
    {vm.state.label}
</div>
