<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import DynamicComponent from "./DynamicComponent.svelte";

    export let createContent: (target: Element) => SvelteComponent
    export let onClick: (event: MouseEvent) => void
</script>

<button class="w-full h-full" on:click={onClick}>
    <DynamicComponent bind:createComponent={createContent}/>
</button>