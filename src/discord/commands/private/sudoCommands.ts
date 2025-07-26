import { createCommand } from "#base";
import { prisma } from "#database";
import { stocksEventuals, res } from "#functions";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

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
        },
        {
            name: "send-mail",
            description: "send a mail to one or more users",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "allusers",
                    description: "send to all users",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false
                },
                {
                    name: "userdb",
                    description: "user in database to send",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    autocomplete: true
                }
            ]
        }
    ],
    async autocomplete(interaction) {
        if (interaction.user.id !== "1171963692984844401") return interaction.respond([{ name: "you cannot send mails!", value: "noPermissionsToSendMail" }]);

        const focused = interaction.options.getFocused()
        const usersPrisma = await prisma.user.findMany()
        const getUserName = async (id: string) => await interaction.client.users.fetch(id)

        const filteredOptions = await Promise.all(
            usersPrisma
                .filter(user => user.id.includes(focused))
                .map(async user => ({
                    name: (await getUserName(user.id)).username,
                    value: user.id
                }))
        );

        interaction.respond(filteredOptions);
        return;
    },
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
                return;
            }
            case "force-stock-variation": {
                await interaction.deferReply();

                await stocksEventuals();

                interaction.editReply(res.success("Forced stock variation"));
                return;
            }
            case "send-mail": {
                await interaction.deferReply({ flags });
                const user = interaction.options.getString("userdb");
            }
        }
    },
});