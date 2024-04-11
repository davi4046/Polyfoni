<script lang="ts">
    import { uniqueId } from "lodash";
    import PopupMenuItem from "./PopupMenuItem.svelte";
    import { Menu } from "./menu";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let x: number;
    export let y: number;
    export let menu: Menu;

    export const id = uniqueId();
</script>

<div
    class="absolute z-50 w-36 border bg-white"
    style="left: {x}px; top: {y}px;"
    on:mouseleave={(event) => dispatch("mouseleave", event)}
    role="none"
    {id}
>
    <div class="flex max-h-32 flex-col overflow-y-auto">
        {#each menu.items as menuItem}
            <PopupMenuItem {menuItem} />
        {/each}
    </div>
</div>
