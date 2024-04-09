<script lang="ts">
    import ArrowRight from "../icons/ArrowRight.svelte";
    import ArrowDown from "../icons/ArrowDown.svelte";

    export let value: boolean;
    export let onToggle: (value: boolean) => void;
</script>

<button
    class="h-full w-full"
    on:click={() => {
        value = !value;
        onToggle(value);
    }}
>
    {#if value}
        <ArrowRight />
    {:else}
        <ArrowDown />
    {/if}
</button>
