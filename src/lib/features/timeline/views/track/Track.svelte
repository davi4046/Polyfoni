<script lang="ts">
    import Item from "../item/Item.svelte";
    import type TrackVM from "../../view_models/track/TrackVM";

    export let trackVM: TrackVM;

    trackVM.subscribe(() => (trackVM = trackVM));
</script>

<div
    class="relative h-[var(--timeline-track-height)] bg-[var(--timeline-track-color)]"
    data-type="track"
    data-model-id={trackVM.id}
>
    {#each trackVM.state.items as itemVM (itemVM.id)}
        <Item {itemVM}></Item>
    {/each}
</div>
