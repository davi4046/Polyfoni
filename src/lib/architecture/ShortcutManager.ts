class Shortcut {
    constructor(
        readonly hotkeys: string[],
        readonly callback: () => void
    ) {}
}

/** @return hotkeys */
function processShortcut(shortcut: string): string[] {
    return shortcut.replaceAll(" ", "").split("+").sort();
}

export default class ShortcutManager {
    private _shortcuts: Shortcut[] = [];
    private _pressedKeys: string[] = [];

    constructor() {
        document.onkeydown = (event) => {
            this._pressedKeys.push(event.code);
            this._pressedKeys.sort();

            for (const shortcut of this._shortcuts) {
                if (
                    shortcut.hotkeys.every((key, index) => {
                        return this._pressedKeys[index] === key;
                    })
                ) {
                    shortcut.callback();
                    break;
                }
            }
        };

        document.onkeyup = (event) => {
            const index = this._pressedKeys.indexOf(event.code);
            this._pressedKeys.splice(index, 1);
        };
    }

    register(shortcut: string, callback: () => void) {
        const hotkeys = processShortcut(shortcut);
        this._shortcuts.push(new Shortcut(hotkeys, callback));
    }

    multiRegister(shortcuts: string[], callback: () => void) {
        for (const shortcut of shortcuts) {
            this.register(shortcut, callback);
        }
    }

    deregister(shortcut: string) {
        const hotkeys = processShortcut(shortcut);
        this._shortcuts = this._shortcuts.filter((shortcut) => {
            return !shortcut.hotkeys.every((key, index) => {
                return hotkeys[index] === key;
            });
        });
    }

    multiDeregister(shortcuts: string[]) {
        for (const shortcut of shortcuts) {
            this.deregister(shortcut);
        }
    }
}
