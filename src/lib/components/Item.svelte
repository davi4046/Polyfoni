<script lang="ts">
    import ItemHandle from "./ItemHandle.svelte";

    import { ItemModel } from "../models";

    export let data: ItemModel;
</script>

<div
    class="absolute z-30 h-full py-1"
    style="width: {(data.end - data.start) * 64}px; left: {data.start * 64}px"
    title={data.content}
>
    <div class="relative h-full">
        <div
            class="relative flex items-center h-full p-2 bg-green-500 border-2"
            class:border-green-600={!data.isSelected()}
            class:border-blue-600={data.isSelected()}
            on:mouseenter={(_) => {
                data.controller?.setHoveredItem(data);
            }}
            on:mouseleave={(_) => {
                data.controller?.setHoveredItem(null);
            }}
            role="none"
        >
            <p class="font-medium text-green-900 truncate">
                {#if data.content}
                    {data.content}
                {:else}
                    [empty]
                {/if}
            </p>
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
