import { createEvent } from "#base";
import { prisma } from "#database";
import { settings } from "#settings";
import { createContainer } from "@magicyan/discord";
import { chatBot } from "./chat/onMessage.js";
import { onMention } from "./onMention.js";
import { MediaGalleryBuilder } from "discord.js";
import { xpSystem } from "./chat/xpSystem.js";
import { onAfkMentioned } from "./onAfkMentioned.js";
import { onResponseTryviaGame } from "./tryvia/response.js";

createEvent({
    name: "onMessage",
    event: "messageCreate",
    async run(message) {
        if (message.author.id === "1171963692984844401") {
            const args = message.content.split(' ')
            const command = args.shift();

            if (!command) return;
            if (command.toLowerCase() === "s.sendmails") {
                const numberOfMails = Number(args[0]);
                const randomWords = [
                    "you", "the", "he", "our", "why", "test", "and", "all", "his", "this", "of",
                    "man", "women", "for", "their", "she", "locale", "traduction", "on", "while", "date",
                    "database"
                ]

                const users = await prisma.user.findMany()
                for (const user of users) {
                    console.log("Creating mails for:", user.id)
                    for (let i = 0; i < numberOfMails; i++) {
                        const sentence = Array.from({ length: 300 }, () => randomWords[Math.floor(Math.random() * randomWords.length)]).join(' ');
                        const mail = await prisma.mails.create({
                            data: {
                                content: sentence,
                                userId: user.id,
                                whoSendId: message.author.id,
                                tags: ["test"],
                            }
                        })
                        console.log("Mail created:", mail.id)
                    }
                }
                message.reply("success")
            }
            if (command.toLowerCase() === "s.test") {
                const avatarUrl = message.author.avatarURL();
                const components = [
                    `# Teste`,
                    new MediaGalleryBuilder({ items: [{ media: { url: avatarUrl! } }] })
                ];
                const container = createContainer({
                    accentColor: settings.colors.fuchsia,
                    components,
                });

                message.reply({ components: [container], flags: ["IsComponentsV2"] })
            }
        }
        onMention(message);
        chatBot(message)
        xpSystem(message)
        onAfkMentioned(message)
        onResponseTryviaGame(message)
    }
});