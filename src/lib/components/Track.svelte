<script lang="ts">
    import Item from "./Item.svelte";

    import { TrackModel } from "../models";

    export let data: TrackModel;
</script>

<div>
    Track
    {#each data.children as item}
        <Item data={item}></Item>
    {/each}
</div>
