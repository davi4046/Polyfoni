import randomChar from "./randomChar";

function randomId(length: number): string {
    return Array.from({ length }, randomChar).join("");
}

export default randomId;
