<script lang="ts">
    import { ItemHandleModel } from "../models";

    export let data: ItemHandleModel;
</script>

<div
    class="z-40 w-2 h-full bg-purple-500 cursor-w-resize"
    on:mouseenter={(_) => {
        console.log("startOf:", data.startOf);
        console.log("endOf:", data.endOf);
    }}
    role="none"
></div>
