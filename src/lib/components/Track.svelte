<script lang="ts">
    import Item from "./Item.svelte";

    import { TrackModel } from "../models";

    export let data: TrackModel;
</script>

<div class="flex h-12">
    <div class="flex w-full bg-gray-400">
        {#each data.children as item}
            <Item data={item}></Item>
        {/each}
    </div>
</div>
