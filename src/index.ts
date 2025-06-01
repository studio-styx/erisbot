import { bootstrap } from "#base"
import { loadTranslations } from "#utils";

await bootstrap({ meta: import.meta });

await loadTranslations();