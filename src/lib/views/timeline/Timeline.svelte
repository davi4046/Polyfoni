<script lang="ts">
    import Track from "./Track.svelte";
    import TrackHeader from "./TrackHeader.svelte";
    import type TimelineVM from "../../view_models/timeline/timeline/TimelineVM";

    export let timelineVM: TimelineVM;
</script>

<div>
    <!-- TOP HEADERS -->
    <div>
        {#each timelineVM.top as trackVMGroup}
            <div>
                {#each trackVMGroup as trackVM}
                    <TrackHeader {trackVM}></TrackHeader>
                {/each}
            </div>
        {/each}
    </div>
    <!-- CENTER HEADERS -->
    <div>
        {#each timelineVM.center as trackVMGroup}
            <div>
                {#each trackVMGroup as trackVM}
                    <TrackHeader {trackVM}></TrackHeader>
                {/each}
            </div>
        {/each}
    </div>
    <!-- BOTTOM HEADERS -->
    <div>
        {#each timelineVM.bottom as trackVMGroup}
            <div>
                {#each trackVMGroup as trackVM}
                    <TrackHeader {trackVM}></TrackHeader>
                {/each}
            </div>
        {/each}
    </div>
    <!-- TOP TRACKS -->
    <div>
        {#each timelineVM.top as trackVMGroup}
            <div>
                {#each trackVMGroup as trackVM}
                    <Track {trackVM}></Track>
                {/each}
            </div>
        {/each}
    </div>
    <!-- CENTER TRACKS -->
    <div>
        {#each timelineVM.center as trackVMGroup}
            <div>
                {#each trackVMGroup as trackVM}
                    <Track {trackVM}></Track>
                {/each}
            </div>
        {/each}
    </div>
    <!-- BOTTOM TRACKS -->
    <div>
        {#each timelineVM.bottom as trackVMGroup}
            <div>
                {#each trackVMGroup as trackVM}
                    <Track {trackVM}></Track>
                {/each}
            </div>
        {/each}
    </div>
</div>
