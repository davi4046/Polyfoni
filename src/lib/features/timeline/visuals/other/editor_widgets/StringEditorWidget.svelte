<script lang="ts">
    import { onMount } from "svelte";

    export let value: string;
    export let update: (value: string) => void;

    let inputField: HTMLInputElement;

    onMount(async () => {
        inputField.focus();
        // TODO: implement some sort of focus lock,
        // otherwise focus is immediately lost
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
