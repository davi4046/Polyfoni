<script lang="ts">
    import { onMount } from "svelte";

    export let value: string;
    export let update: (value: string) => void;

    let inputField: HTMLInputElement;

    onMount(() => {
        setTimeout(() => {
            inputField.select();
        }, 0);
    });

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key !== "Enter") return;
        update(value);
    }
</script>

<div class="p-2">
    <input
        on:keydown={handleKeyDown}
        bind:this={inputField}
        bind:value
        placeholder="Input..."
        class="w-full p-1 text-lg font-medium focus:outline-none"
        type="text"
    />
</div>
