/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{svelte,js,ts}"],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "Chivo-VariableFont_wght",
                    "Chivo-Italic-VariableFont_wght",
                ],
                mono: [
                    "ChivoMono-VariableFont_wght",
                    "ChivoMono-Italic-VariableFont_wght",
                ],
            },
        },
    },
    plugins: [],
};
