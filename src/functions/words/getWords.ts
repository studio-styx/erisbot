import fs from "fs/promises";
import { WordsObject } from "./pipeline.js";

export async function getWords(language: "ptbr" | "en" | "es" = "ptbr", size?: 4 | 5 | 6) {
    const raw = await fs.readFile(`${__rootname}/localdb/words.json`, "utf-8");
    const words = JSON.parse(raw) as WordsObject;
    if (size) {
        return words[language].words.filter(w => w.length === size);
    }
    return words[language].words;
}