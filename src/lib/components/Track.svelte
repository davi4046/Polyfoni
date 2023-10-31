<script lang="ts">
    import TrackShell from "./TrackShell.svelte";
    import Item from "./Item.svelte";
    import Highlight from "./Highlight.svelte";

    import { TrackModel } from "../models";

    export let data: TrackModel;
</script>

<div
    on:mouseenter={(_) => {
        data.controller?.setHoveredTrack(data);
    }}
    role="none"
>
    <TrackShell>
        {#each data.children as item}
            <Item bind:data={item}></Item>
        {/each}
        {#if data.controller?.highlight?.tracks.includes(data)}
            {#each data.controller?.highlight?.intervals as interval}
                <Highlight
                    width={(interval[1] - interval[0]) * 64}
                    left={interval[0] * 64}
                />
            {/each}
        {/if}
    </TrackShell>
</div>
