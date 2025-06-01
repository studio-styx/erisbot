import { bootstrap } from "#base"
import { startEvents } from "#logic";
import { loadTranslations } from "#utils";

await bootstrap({ meta: import.meta });

await loadTranslations();
await startEvents();