<script lang="ts">
    import Item from "../item/Item.svelte";
    import type { ItemTrackVMState } from "../../../view_models/TrackVM";
    import type Model from "../../../../../architecture/Model";

    export let vm: Model<ItemTrackVMState>;

    vm.subscribe(() => (vm = vm));
</script>

<div
    class="relative h-[var(--timeline-track-height)] bg-[var(--timeline-track-color)]"
    data-type="track"
    data-model-id={vm.id}
>
    {#each vm.state.items as itemVM (itemVM.id)}
        <Item vm={itemVM}></Item>
    {/each}
</div>
