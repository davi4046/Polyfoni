<script lang="ts">
    import { onMount } from "svelte";
    import type Item from "../../../../models/item/Item";
    import type TimelineContext from "../../../context/TimelineContext";

    export let item: Item<"StringItem">;
    export let context: TimelineContext;

    let value = item.state.content;

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key !== "Enter" || value === item.state.content) return;
        context.history.startAction("Edit string item content");
        item.state = {
            content: value,
        };
        context.history.endAction();
    }

    let inputField: HTMLInputElement;

    onMount(() => {
        setTimeout(() => {
            inputField.select();
        }, 0);
    });
</script>

<div class="border-t-2 border-black p-2">
    <input
        on:keydown={handleKeyDown}
        bind:this={inputField}
        bind:value
        placeholder="Input..."
        class="w-full p-1 text-lg font-medium focus:outline-none"
        type="text"
    />
</div>
