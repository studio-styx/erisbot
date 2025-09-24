import axios from "axios";
import fs from "fs/promises"

export interface WordApiResponse {
    word: string;
    length: number;
    category: string;
    language: "pt-br" | "en" | "es";
}

type LanguageWordObject = {
    words: WordApiResponse[];
}

export interface WordsObject {
    ptbr: LanguageWordObject;
    en: LanguageWordObject;
    es: LanguageWordObject;
}

export async function wordPipeline() {
    const ptbrWords = await axios.get("https://random-words-api.kushcreates.com/api?language=pt-br&words=99").catch(() => null);
    const enWords = await axios.get("https://random-words-api.kushcreates.com/api?language=en&words=99").catch(() => null);
    const esWords = await axios.get("https://random-words-api.kushcreates.com/api?language=es&words=99").catch(() => null);

    const allWords = [...((ptbrWords?.data as WordApiResponse[]) || []), ...((enWords?.data as WordApiResponse[]) || []), ...((esWords?.data as WordApiResponse[]) || [])];

    const objectBefore = JSON.parse((await fs.readFile(`${__rootname}/localdb/words.json`, "utf-8"))) as WordsObject;
    for (const wordData of allWords) {
        if (wordData.word.length < 4 || wordData.word.length > 6) continue;
        if (wordData.word.includes(" ")) continue;
        if (wordData.language === "pt-br") {
            if (objectBefore?.ptbr.words.some(w => w.word.toLowerCase() === wordData.word.toLowerCase())) continue;
            objectBefore?.ptbr.words.push(wordData);
        } else if (wordData.language === "en") {
            if (objectBefore?.en.words.some(w => w.word.toLowerCase() === wordData.word.toLowerCase())) continue;
            objectBefore?.en.words.push(wordData);
        } else if (wordData.language === "es") {
            if (objectBefore?.es.words.some(w => w.word.toLowerCase() === wordData.word.toLowerCase())) continue;
            objectBefore?.es.words.push(wordData);
        }
    }
    await fs.writeFile(`${__rootname}/localdb/words.json`, JSON.stringify(objectBefore, null, 4));
    return;
}