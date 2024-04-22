import { resolveResource } from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/api/fs";
import { emit } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api";

import { load } from "js-yaml";

import type StateHierarchyWatcher from "../../../architecture/StateHierarchyWatcher";
import {
    countAncestors,
    getNestedArrayOfDescendants,
} from "../../../architecture/state-hierarchy-utils";
import compareArrays from "../../../utils/compareArrays";
import type Item from "../../models/item/Item";
import type Timeline from "../../models/timeline/Timeline";

export default class AliasManager {
    async init(watcher: StateHierarchyWatcher<Timeline>) {
        const timeline = watcher.root;
        const trackedAliases = await loadTimelineAliases(timeline);

        // Remove unused aliases
        {
            const unusedAliases: string[] = [];

            trackedAliases.forEach((refCount, alias) => {
                if (refCount === 0) unusedAliases.push(alias);
            });

            timeline.state = {
                aliases: watcher.root.state.aliases.filter(
                    (alias) => !unusedAliases.includes(alias.name)
                ),
            };

            unusedAliases.forEach((alias) => trackedAliases.delete(alias));
        }

        const builtins = new Map<string, string>();

        // Load builtin aliases
        {
            const path = await resolveResource("res/builtin_aliases.yaml");
            const content = await readTextFile(path);

            Object.entries(load(content) as object).forEach(
                ([alias, value]) => {
                    const cleanedValue = value
                        .replace(/\r?\n|\r/g, "") // Remove linebreaks
                        .replace(/\s+/g, " "); // Remove redundant spaces

                    builtins.set(alias, cleanedValue);
                }
            );
        }

        function handleAddedName(name: string) {
            if (trackedAliases.has(name)) {
                trackedAliases.set(name, trackedAliases.get(name)! + 1);
            } else if (builtins.has(name)) {
                trackedAliases.set(name, 1);
                timeline.state = {
                    aliases: timeline.state.aliases.concat({
                        name: name,
                        value: builtins.get(name)!,
                    }),
                };
                emit("display-message", {
                    message: `Added Builtin: ${name}`,
                });
            }
        }

        function handleRemovedName(name: string) {
            if (!trackedAliases.has(name)) return;

            const newValue = trackedAliases.get(name)! - 1;

            if (newValue > 0) {
                trackedAliases.set(name, newValue);
            } else {
                trackedAliases.delete(name);
                timeline.state = {
                    aliases: timeline.state.aliases.filter(
                        (alias) => alias.name !== name
                    ),
                };
                emit("display-message", {
                    message: `Removed Builtin: ${name}`,
                });
            }
        }

        watcher.subscribe(async (obj, oldState) => {
            const objDepth = countAncestors(obj);
            const newState = obj.state as any;

            switch (objDepth) {
                // Track
                case 4: {
                    const { removedItems, addedItems } = compareArrays<
                        Item<any>
                    >(oldState.children, newState.children);

                    const removedPromises = removedItems.map((item) =>
                        getVariableNames(item.state.content)
                    );
                    const addedPromises = addedItems.map((item) =>
                        getVariableNames(item.state.content)
                    );

                    const [removedVarNames, addedVarNames] = await Promise.all([
                        Promise.all(removedPromises),
                        Promise.all(addedPromises),
                    ]);

                    addedVarNames.flat().forEach(handleAddedName);
                    removedVarNames.flat().forEach(handleRemovedName);
                    break;
                }
                // Item
                case 5: {
                    const [oldVarNames, newVarNames] = await Promise.all([
                        getVariableNames(oldState.content),
                        getVariableNames(newState.content),
                    ]);

                    const { removedItems, addedItems } = compareArrays(
                        oldVarNames,
                        newVarNames
                    );

                    addedItems.forEach(handleAddedName);
                    removedItems.forEach(handleRemovedName);
                    break;
                }
            }
        });
    }
}

async function loadTimelineAliases(
    timeline: Timeline
): Promise<Map<string, number>> {
    const items = (
        getNestedArrayOfDescendants(timeline, 5).flat(Infinity) as Item<any>[]
    ).filter(
        (item): item is Item<"StringItem"> => item.itemType === "StringItem"
    );

    const promises = items.map((item) => getVariableNames(item.state.content));

    const varNames = (await Promise.all(promises)).flat();

    return new Map(
        timeline.state.aliases.map((alias) => {
            const refCount = varNames.reduce((count, value) => {
                return value === alias.name ? count + 1 : count;
            }, 0);
            return [alias.name, refCount];
        })
    );
}

async function getVariableNames(pythonString: string): Promise<string[]> {
    return invoke("evaluate", {
        task: `find_vars ||| ${pythonString}`,
    }).then((result) => {
        try {
            const parsedResult = JSON.parse(
                (result as string).replaceAll(`'`, `"`)
            );
            return Array.from(new Set(parsedResult));
        } catch {
            return [];
        }
    });
}