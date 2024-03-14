<script lang="ts">
    import type TrackVM from "../../../view_models/TrackVM";

    export let vm: TrackVM<any>;

    vm.subscribe(() => (vm = vm));
</script>

<div
    class="flex h-[var(--timeline-track-height)] w-full items-center whitespace-nowrap p-2"
    data-type="header"
    data-model-id={vm.id}
>
    <div class="mr-2 h-6 w-6 overflow-clip">
        <slot name="icon" />
    </div>
    {vm.state.label}
</div>
