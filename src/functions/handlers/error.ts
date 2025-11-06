import { GenericResponderInteraction } from "#base";
import { ChatInputCommandInteraction, CommandInteraction, DiscordAPIError } from "discord.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { icon, res } from "#functions";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { brBuilder } from "@magicyan/discord";

export function serverErrorHandler(error: any, _req: FastifyRequest, reply: FastifyReply) {
    if (error instanceof ZodError) {
        return reply.status(StatusCodes.BAD_REQUEST).send({
            message: "Invalid information",
            errors: error.issues.map(err => ({
                path: err.path.join("."),
                message: err.message,
            }))
        });
    }

    if (error instanceof DiscordAPIError) {
        return reply.status(error.status).send({
            message: error.message
        })
    }

    console.error(error);

    return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
}

export async function discordErrorHandler(interaction: GenericResponderInteraction | CommandInteraction, error: unknown): Promise<void> {
    const sendMessage = async (message: string, addErrorIcon: boolean = true) => {
        const finalMessage = addErrorIcon ? `${icon.error} | ${message}` : message;
        
        if (interaction.deferred) {
            try {
                await interaction.editReply(res.danger(finalMessage));
            } catch (_) {
                try {
                    await interaction.editReply(res.danger(finalMessage));
                } catch (_) {
                    await interaction.followUp(res.danger(finalMessage));
                }
            }
        } else if (!interaction.replied) {
            await interaction.reply(res.danger(finalMessage));
        } else {
            await interaction.followUp(res.danger(finalMessage));
        }
        return;
    }

    if (error instanceof ZodError) {
        const errors = error.issues.map(e => `**\`${e.message}\`**`).join("\n");

        const errorMessage = `${icon.error} | Informações inválidas! \n${errors}`;

        await sendMessage(errorMessage);
        return;
    }

    if (error instanceof ErisError) {
        await sendMessage(error.message, error.errorEmoji);
        return;
    }

    await sendMessage(`Um erro inesperado ocorreu ao executar ${interaction.isCommand() ? "esse comando!" : "essa interação!"}: \`${error instanceof Error ? error.message : "Unknown error"}\``);

    try {
        const guild = interaction.client.guilds.cache.get("1395383469210865694")!;
        const channel = guild.channels.cache.get("1431993706625368235") || await guild.channels.fetch("1431993706625368235");

        if (!channel || !channel.isTextBased()) return;

        let errorLocale: string = "";

        if (interaction.isCommand()) {
            const commandName = interaction.commandName;
            const subCommand = (interaction as ChatInputCommandInteraction).options.getSubcommand(false);
            const subCommandGroup = (interaction as ChatInputCommandInteraction).options.getSubcommandGroup(false);
    
            const fullCommandName = subCommandGroup ? `${commandName} ${subCommandGroup} ${subCommand}` : subCommand ? `${commandName} ${subCommand}` : commandName;
            errorLocale = fullCommandName;
        } else {
            errorLocale = interaction.customId;
        }

        const errMessage = error instanceof Error
            ? error.message
            : (typeof error === "object" ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error));
        const errStack = error instanceof Error
            ? (error.stack ?? "No stack available")
            : "No stack available";

        await channel.send(res.danger(brBuilder(
            `**Error in ${interaction.isCommand() ? "the command" : "the interaction"} \`${errorLocale}\` used by user \`${interaction.user.tag}\` in guild \`${interaction.guild?.name || "Direct Message"}\`**`,
            "```json",
            `"message": ${JSON.stringify(errMessage)}`,
            `"stack": ${JSON.stringify(errStack)}`,
            "```"
        )));

        await interaction.followUp(res.success(`${icon.success} | The error has been logged to the designated channel.`));
    } catch (e) {
        console.error("Failed to send error message to the log channel:", e);
        await interaction.followUp(res.danger(`${icon.error} | Additionally, failed to log the error to the designated channel.`));
    }
}

export class ErisError extends Error {
    public errorEmoji: boolean = true;
    constructor(message: string, errorEmoji: boolean = true) {
        super(message);
        this.name = "ErisError";
        this.errorEmoji = errorEmoji;
    }
}