<script lang="ts">
    import { onMount } from "svelte";
    import type Item from "../../models/Item";

    export let item: Item<"StringItem">;

    let value = item.state.content;

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key !== "Enter") return;
        item.state = {
            content: value,
        };
    }

    let inputField: HTMLInputElement;

    onMount(() => {
        setTimeout(() => {
            inputField.select();
        }, 0);
    });
</script>

<div class="p-2 border-t-2 border-black">
    <input
        on:keydown={handleKeyDown}
        bind:this={inputField}
        bind:value
        placeholder="Input..."
        class="w-full p-1 text-lg font-medium focus:outline-none"
        type="text"
    />
</div>
