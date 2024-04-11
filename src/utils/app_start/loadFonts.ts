import { readDir } from "@tauri-apps/api/fs";
import { resolveResource } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";

export default async function loadFonts() {
    const fontDir = await resolveResource("res/fonts/");
    const fontFiles = await readDir(fontDir);

    for (const { name, path } of fontFiles) {
        const [fontName] = name?.split(".") || [];

        if (!fontName) return;

        for (let i = 0; i < 10; i++) {
            const font = new FontFace(
                fontName,
                `url(${convertFileSrc(path)})`,
                {
                    weight: `${(i + 1) * 100}`,
                }
            );
            try {
                const loadedFont = await font.load();
                document.fonts.add(loadedFont);
            } catch (error) {
                console.warn("Failed to load font: " + error);
            }
        }
    }
}
