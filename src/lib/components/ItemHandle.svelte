<script lang="ts">
    import { ItemHandleModel } from "../models";

    export let data: ItemHandleModel;
</script>

<div
    class="z-40 w-2 h-full"
    on:mouseenter={(_) => {
        data.controller?.setHoveredHandle(data);
    }}
    on:mouseleave={(_) => {
        data.controller?.setHoveredHandle(null);
    }}
    role="none"
></div>
