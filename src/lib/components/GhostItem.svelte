<script lang="ts">
    import type { GhostItemModel } from "../models";

    export let data: GhostItemModel;
</script>

<div
    class="absolute z-40 h-full py-1 pointer-events-none"
    style="width: {(data.end - data.start) * 64}px; left: {data.start * 64}px"
>
    <div class="border-opacity-75 opacity-75 item">
        <p class="truncate">
            {#if data.item.content}
                {data.item.content}
            {:else}
                [empty]
            {/if}
        </p>
    </div>
</div>
