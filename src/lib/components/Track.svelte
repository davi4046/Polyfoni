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
    on:mouseleave={(_) => {
        data.controller?.setHoveredTrack(null);
    }}
    role="none"
>
    <TrackShell>
        {#each data.children as item}
            <Item bind:data={item}></Item>
        {/each}
        {#each data.uncoveredIntervals as interval}
            {@const width = (interval[1] - interval[0]) * 64 + 1}
            {@const left = interval[0] * 64}
            <div
                class="squiggly-line-blue absolute h-3 bottom-0 -my-1 z-40"
                style="width:{width}px; left:{left}px;"
            ></div>
        {/each}
        {@const controller = data.controller}
        {#if controller}
            {@const highlight = controller.highlight}
            {#if highlight}
                {#if highlight.tracks.includes(data)}
                    <Highlight
                        width={(highlight.end - highlight.start) * 64 + 1}
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
