import { bootstrap } from "#base"
import { startEvents } from "functions/logic/index.js";
import { loadTranslations } from "functions/utils/index.js";

await bootstrap({ meta: import.meta });

await loadTranslations();
await startEvents();