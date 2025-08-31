import { createEvent } from "#base";
import { setAllServerSettings, tryviaPipeline } from "#functions";

createEvent({
    name: "ready",
    event: "ready",
    async run (client) {
        await setAllServerSettings(client);
        tryviaPipeline();
    }
});