import { createEvent } from "#base";
import { setAllServerSettings } from "#functions";
import { tryviaPipeline } from "functions/tryvia/tryviaPipeline.js";

createEvent({
    name: "ready",
    event: "ready",
    async run (client) {
        await setAllServerSettings(client);
        tryviaPipeline()
    }
});