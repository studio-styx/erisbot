import { createEvent } from "#base";
import { setAllServerSettings, processApiQuestions, tryviaPipeline } from "#functions";

createEvent({
    name: "ready",
    event: "ready",
    async run (client) {
        await setAllServerSettings(client);
        // processApiQuestions()
        tryviaPipeline();
    }
});