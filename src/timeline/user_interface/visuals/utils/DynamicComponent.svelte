<script lang="ts">
    import { type SvelteComponent } from "svelte";

    export let createComponent:
        | ((target: Element) => SvelteComponent)
        | undefined;

    let targetElement: HTMLDivElement;
    let component: SvelteComponent;

    let prev: any;

    $: {
        if (targetElement && createComponent !== prev) {
            component?.$destroy();
            if (createComponent) component = createComponent(targetElement);
            prev = createComponent;
        }
    }
</script>

<div bind:this={targetElement}></div>
