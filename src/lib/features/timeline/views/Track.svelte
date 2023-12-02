<script lang="ts">
    import Item from "./Item.svelte";
    import type TrackVM from "../view_models/track/TrackVM";

    export let trackVM: TrackVM;
</script>

<div class="relative h-[var(--track-height)] bg-[var(--track-color)]">
    {#each trackVM.items as itemVM}
        <Item {itemVM}></Item>
    {/each}
</div>
