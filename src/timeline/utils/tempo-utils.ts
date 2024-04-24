import { invoke } from "@tauri-apps/api";

import { getLastAncestor } from "../../architecture/state-hierarchy-utils";
import type Item from "../models/item/Item";

export type TempoChange = {
    beat: number;
    tempo: number;
};

export async function deriveTempoChangesFromItems(
    items: Item<"StringItem">[],
    defaultTempo: number
): Promise<TempoChange[]> {
    const tempoChanges = new Map<number, number>();
    tempoChanges.set(0, defaultTempo);

    items = items.slice();
    items.sort((a, b) => a.state.start - b.state.start);

    const promises: Promise<void>[] = [];

    items.forEach((item) => {
        const args = getLastAncestor(item).state.aliases;

        const promise = invoke("evaluate", {
            task: `eval ||| ${item.state.content} ||| ${JSON.stringify(args)}`,
        }).then((result) => {
            const parsedResult = Number(result);

            if (isNaN(parsedResult)) {
                item.state = {
                    error: "Failed to evaluate to a number",
                };
                return;
            }
            if (parsedResult < 15) {
                item.state = {
                    error: "Result is too small (range: 15-360)",
                };
                return;
            }
            if (parsedResult > 360) {
                item.state = {
                    error: "Result is too large (range: 15-360)",
                };
                return;
            }

            item.state = {
                error: undefined,
            };

            tempoChanges.set(item.state.start, parsedResult);
            tempoChanges.set(item.state.end, defaultTempo);
        });
        promises.push(promise);
    });
    await Promise.all(promises);

    return Array.from(tempoChanges).map(([beat, tempo]) => {
        return { beat, tempo };
    });
}
