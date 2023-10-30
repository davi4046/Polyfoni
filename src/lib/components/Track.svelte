<script lang="ts">
    import TrackShell from "./TrackShell.svelte";
    import Item from "./Item.svelte";

    import { TrackModel } from "../models";

    export let data: TrackModel;
</script>

<div
    on:mouseenter={(_) => {
        data.controller?.setHoveredNode(data);
    }}
    role="none"
>
    <TrackShell>
        {#each data.children as item}
            <Item bind:data={item}></Item>
        {/each}
    </TrackShell>
</div>
