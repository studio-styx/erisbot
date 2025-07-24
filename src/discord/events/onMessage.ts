import { createEvent } from "#base";
import { chatBot } from "./chat/onMessage.js";
import { onMention } from "./onMention.js";

createEvent({
    name: "onMessage",
    event: "messageCreate",
    async run (message) {
        onMention(message);
        chatBot(message)
    }
});