import { bootstrap } from "#base"
import { startEvents } from "#functions";

await bootstrap({ meta: import.meta });

await startEvents();