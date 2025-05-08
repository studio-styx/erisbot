import { bootstrap } from "#base"
import { loadTranslations } from "utils/loadTranslactions.js";

await bootstrap({ meta: import.meta });

await loadTranslations();