<script lang="ts">
    import TrackShell from "./TrackShell.svelte";
    import Item from "./Item.svelte";
    import Highlight from "./Highlight.svelte";
    import GhostItem from "./GhostItem.svelte";

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
        {@const controller = data.controller}
        {#if controller}
            {@const highlight = controller.highlight}
            {#if highlight}
                {#if highlight.tracks.includes(data)}
                    <Highlight
                        width={(highlight.end - highlight.start) * 64}
                        left={highlight.start * 64}
                    />
                {/if}
            {/if}
            {#each controller.ghostItems as ghostItem}
                {#if ghostItem.track == data}
                    <GhostItem data={ghostItem} />
                {/if}
            {/each}
        {/if}
    </TrackShell>
</div>
