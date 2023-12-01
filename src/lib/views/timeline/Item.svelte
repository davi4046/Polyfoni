<script lang="ts">
    import type ItemVM from "../../view_models/timeline/item/ItemVM";

    export let itemVM: ItemVM;
</script>

<div>
    {itemVM.start}
    {itemVM.end}
    {itemVM.text}
</div>
