<script lang="ts">
    import Item from "./Item.svelte";
    import type TrackVM from "../../view_models/timeline/track/TrackVM";

    export let trackVM: TrackVM;
</script>

<div>
    {#each trackVM.items as itemVM}
        <Item {itemVM}></Item>
    {/each}
</div>
