<script lang="ts">
    import type { ItemMove } from "../models";

    export let data: ItemMove;
</script>

<div
    class="absolute z-40 h-full py-1.5 pointer-events-none"
    style="width: {(data.newEnd - data.newStart) * 64}px; left: {data.newStart *
        64}px"
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
