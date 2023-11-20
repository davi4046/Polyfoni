<script lang="ts">
    import ItemHandle from "./ItemHandle.svelte";

    import { ItemModel } from "../models";

    export let data: ItemModel;
</script>

<div
    class="absolute z-30 h-full py-1"
    style="width: {(data.end - data.start) * 64 + 1}px; left: {data.start *
        64}px"
>
    <div class="relative h-full">
        <div
            class="relative item"
            title={data.error
                ? data.content + "\n\n" + data.error
                : data.content}
            class:selected={data.isSelected()}
            on:mouseenter={(_) => {
                data.controller?.setHoveredItem(data);
            }}
            on:mouseleave={(_) => {
                data.controller?.setHoveredItem(null);
            }}
            role="none"
        >
            <p class="truncate">
                {#if data.content}
                    {data.content}
                {:else}
                    [empty]
                {/if}
            </p>
            {#if data.error}
                <div
                    class="error h-3 w-full left-0 absolute bottom-0 -my-3 pointer-events-none"
                />
            {/if}
        </div>
        {#if data.startHandle}
            <div class="absolute top-0 bottom-0 left-0 -translate-x-1/2">
                <ItemHandle data={data.startHandle} />
            </div>
        {/if}
        {#if data.endHandle}
            <div class="absolute top-0 bottom-0 right-0 translate-x-1/2">
                <ItemHandle data={data.endHandle} />
            </div>
        {/if}
    </div>
</div>

<style>
    .error {
        background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><path stroke="red" stroke-width="2" fill="none" vector-effect="non-scaling-stroke" d="M 0 100 L 50 50 L 100 100"/></svg>');
        background-repeat: repeat-x;
    }
</style>
