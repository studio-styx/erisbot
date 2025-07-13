import { createCommand } from "#base";
import { stocksEventuals } from "functions/logic/index.js";
import { Prisma, PrismaClient } from "#prisma/client";
import { res } from "functions/utils/index.js";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

const prisma = new PrismaClient();

createCommand({
    name: "sudo",
    description: "sudo commands",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "database",
            description: "manage database",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "query",
                    description: "query to use",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                }
            ],
        },
        {
            name: "test",
            description: "test function",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "force-stock-variation",
            description: "force stock variation",
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    async run(interaction) {
        if (interaction.user.id !== "1171963692984844401") {
            interaction.reply(res.danger("You are not allowed to use this command!"));
            return;
        }
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "database": {
                interaction.reply(res.danger("Not happening"))
                return;
            }
            case "test": {
                await interaction.deferReply();

                interaction.editReply(res.success("Tested"));
            }
            case "force-stock-variation": {
                await interaction.deferReply();

                await stocksEventuals();

                interaction.editReply(res.success("Forced stock variation"));
            }
        }
    },
});