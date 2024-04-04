<script lang="ts">
    import { onMount } from "svelte";

    export let value: string;
    export let update: (value: string) => void;

    export const reflectChange = (newValue: string) => {
        value = newValue;
    };

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
        class="w-full p-1 font-mono text-lg font-semibold focus:outline-none"
        type="text"
        placeholder="Input..."
        on:keydown={handleKeyDown}
        bind:this={inputField}
        bind:value
    />
</div>
