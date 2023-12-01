export default abstract class HotkeyHandler {
    private static hotkeys: Hotkey[] = [];
    private static pressedKeys: string[] = [];

    public static registerHotkey(
        keyCombinations: string | string[],
        callback: () => void
    ) {
        if (!Array.isArray(keyCombinations))
            keyCombinations = [keyCombinations];

        keyCombinations.forEach((keyCombination) => {
            this.hotkeys.push(new Hotkey(keyCombination.split("+"), callback));
        });
    }

    private static _init = (() => {
        document.onkeydown = (e) => {
            if (this.pressedKeys.includes(e.code)) return;

            this.pressedKeys.push(e.code);

            for (let hotkey of this.hotkeys) {
                let match = hotkey.keys.every((key, index) => {
                    return this.pressedKeys[index] === key;
                });

                if (!match) continue;

                hotkey.callback();
                break;
            }
        };

        document.onkeyup = (e) => {
            this.pressedKeys = this.pressedKeys.filter((key) => {
                return key !== e.code;
            });
        };
    })();
}

class Hotkey {
    constructor(
        public keys: string[],
        public callback: () => void
    ) {}
}
