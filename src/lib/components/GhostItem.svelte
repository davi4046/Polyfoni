<script lang="ts">
    import type { ItemData } from "../models";

    export let data: ItemData;
</script>

<div
    class="absolute z-40 h-full py-1.5 pointer-events-none"
    style="width: {(data.end - data.start) * 64}px; left: {data.start * 64}px"
>
    <div class="border-opacity-75 opacity-75 item">
        <p class="truncate">
            {#if data.content}
                {data.content}
            {:else}
                [empty]
            {/if}
        </p>
    </div>
</div>
