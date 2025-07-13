import { createEvent } from "#base";
import { setAllServerSettings } from "#functions";

createEvent({
    name: "ready",
    event: "ready",
    async run (client) {
        await setAllServerSettings(client);
    }
});