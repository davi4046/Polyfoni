<script lang="ts">
    import { onMount } from "svelte";

    export let value: string;
    export let update: (value: string) => void;

    let prevValue: string;

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key !== "Enter" || value === prevValue) return;
        prevValue = value;
        update(value);
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
        class="w-full p-1 font-mono text-lg font-medium focus:outline-none"
        type="text"
    />
</div>
