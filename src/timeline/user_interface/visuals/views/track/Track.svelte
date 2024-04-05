<script lang="ts">
    import Item from "../item/Item.svelte";
    import type TrackVM from "../../../view_models/TrackVM";

    export let vm: TrackVM;

    vm.subscribe(() => (vm = vm));
</script>

<div
    class="relative h-[var(--timeline-track-height)] bg-[var(--timeline-track-color)]"
    id={vm.state.idPrefix + "-root"}
>
    {#each vm.state.items as itemVM (itemVM.id)}
        <Item vm={itemVM}></Item>
    {/each}
</div>
