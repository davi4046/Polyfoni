<script lang="ts">
    import { onMount } from "svelte";
    import type { ItemModel } from "../models";
    import Item from "./Item.svelte";

    export let data: ItemModel;
    export let onClose: Function;

    let popup: HTMLElement;
    let input: HTMLInputElement;

    onMount(() => {
        input.focus();
    });

    function apply() {
        data.content = input.value;
        close();
    }

    function close() {
        onClose();
        popup.remove();
    }
</script>

<div
    class="absolute z-50 h-48 -translate-x-1/2 -translate-y-1/2 bg-gray-400 border border-gray-500 shadow-xl w-96 inset-1/2"
    bind:this={popup}
>
    <div class="grid grid-rows-[1fr,1fr,1fr] h-full p-4">
        <div class="text-2xl">Edit</div>
        <div>
            <input
                class="w-full p-2"
                type="text"
                bind:this={input}
                value={data.content}
                on:keydown={(event) => {
                    if (event.key == "Enter") {
                        apply();
                    }
                }}
            />
        </div>
        <div class="flex items-end justify-end">
            <button
                class="mr-2 btn btn-sm btn-primary"
                on:click={(_) => {
                    apply();
                }}>Apply</button
            >
            <button
                class="btn btn-sm btn-alternative"
                on:click={(_) => {
                    close();
                }}>Cancel</button
            >
        </div>
    </div>
</div>
