<script lang="ts">
    import { type SvelteComponent } from "svelte";

    export let createComponent: (target: Element) => SvelteComponent;

    let targetElement: HTMLDivElement;
    let component: SvelteComponent;

    $: {
        if (targetElement) {
            component?.$destroy();
            component = createComponent(targetElement);
        }
    }
</script>

<div bind:this={targetElement}></div>
