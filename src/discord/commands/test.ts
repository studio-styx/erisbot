import { createCommand, createResponder, ResponderType } from "#base";
import { resv2 } from "#functions";
import { createTextDisplay } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle } from "discord.js";

createCommand({
    name: "test",
    description: "test command",
    type: ApplicationCommandType.ChatInput,
    async run(interaction){
        await interaction.deferReply();
        interaction.editReply(
            resv2.fuchsia(
                `Teste mensagem 1`,
                createTextDisplay("Teste mensagem 2", 5),
                new ButtonBuilder({
                    customId: "test/command",
                    label: "clique aqui",
                    style: ButtonStyle.Secondary
                }),
                `Mensagem 4`
            )
        )
        return;
    }
});

createResponder({
    customId: "test/command",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction) {
        const components = interaction.message.components as unknown as MessageObject[];
        console.log(JSON.stringify(components))
        interaction.reply(
            resv2.success(components[0].components.find(c => c.id === 5)?.content)
        )
        return;
    },
});

interface MessageObject {
    type: number;
    spoiler: boolean;
    id: number;
    accent_color: number;
    components: {
        type: number;
        id: number;
        content: string;
    }[]
}
