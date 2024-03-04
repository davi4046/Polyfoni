<script lang="ts">
    import { onMount } from "svelte";

    export let value: string | null;
    export let update: (value: string | null) => void;

    let inputField: HTMLInputElement;

    onMount(() => {
        setTimeout(() => {
            inputField.focus();
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
        class="h-10 w-full pl-2 text-lg"
        type="text"
    />
</div>
