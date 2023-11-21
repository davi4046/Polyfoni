<script lang="ts">
    import ItemHandle from "./ItemHandle.svelte";
    import Highlight from "./Highlight.svelte";

    import { ItemModel } from "../models";

    export let data: ItemModel;

    $: width = (data.end - data.start) * 64 + 1;
    $: left = data.start * 64;
</script>

<div class="absolute h-full py-1.5" style="width: {width}px; left: {left}px">
    <div
        class="relative z-40 item"
        title={data.content}
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
        {#if data.startHandle}
            <div class="absolute top-0 bottom-0 left-0 z-50 -translate-x-1/2">
                <ItemHandle data={data.startHandle} />
            </div>
        {/if}
        {#if data.endHandle}
            <div class="absolute top-0 bottom-0 right-0 z-50 translate-x-1/2">
                <ItemHandle data={data.endHandle} />
            </div>
        {/if}
    </div>
</div>
{#if data.error}
    <div
        class="absolute z-30 h-full"
        style="width: {width}px; left: {left}px;"
        title={data.error}
    >
        <Highlight stripeColor="#ef4444" />
    </div>
{/if}
