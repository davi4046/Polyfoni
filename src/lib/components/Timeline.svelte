<script lang="ts">
    import Voice from "./Voice.svelte";
    import VoiceHeader from "./VoiceHeader.svelte";

    import { TimelineModel } from "../models";

    export let data: TimelineModel;
</script>

<div class="flex h-full p-4 space-x-1 bg-gray-500">
    <div class="space-y-4">
        {#each data.children as voice}
            <VoiceHeader data={voice}></VoiceHeader>
        {/each}
    </div>
    <div class="h-full overflow-scroll">
        <div class="relative" style="width: {data.length * 64}px">
            {#each Array(data.length - 1) as _, index}
                <div
                    class="absolute top-0 w-0.5 h-full bg-gray-500"
                    style="left: {index * 64 + 64}px"
                />
            {/each}
            <div class="space-y-4">
                {#each data.children as voice}
                    <Voice data={voice}></Voice>
                {/each}
            </div>
        </div>
    </div>
</div>
