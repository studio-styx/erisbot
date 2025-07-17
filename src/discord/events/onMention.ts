import { createEvent } from "#base";
import { getCommandId, res } from "#functions";
import { Interaction } from "discord.js";

createEvent({
    name: "onMention",
    event: "messageCreate",
    async run(interaction) {
        if (interaction.author.bot) return;
        const botId = interaction.client.user?.id;
        if (interaction.content !== `<@${botId}>` && interaction.content !== `<@!${botId}>`) return;

        const { author } = interaction;
        const commandId = await getCommandId(interaction as unknown as Interaction, "bot")
        
        interaction.channel.send(res.success(`Olá <@${author.id}>, está interessado em mim? veja meus comandos! </bot commands:${commandId}>`))
        return;
    }
});