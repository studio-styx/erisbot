import { getCommandId } from "#functions";
import { settings } from "#settings";
import { Command } from "#types/commands.js";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, Interaction, StringSelectMenuBuilder, type InteractionReplyOptions } from "discord.js";

const categoryFormatted: Record<string, string> = {
    economy: "economia",
    general: "gerais",
    cassino: "cassino",
    moderation: "moderação",
    investment: "investimentos",
    utility: "utilidades",
    fun: "diversão",
    pet: "pet"
}

export async function commandsMenu<R>(category: string, commands: Command[], page: number, interaction: Interaction): Promise<R> {
    const commandsPerPage = 6;
    const pageCommands = commands.filter(c => c.category === category).slice((page - 1) * commandsPerPage, page * commandsPerPage);
    const pages = Math.ceil(commands.filter(c => c.category === category).length / commandsPerPage);

    const commandsFormatted: (Command & { discordId: string, primaryName: string})[] = [];
    
    const commandsIdsPromises = pageCommands.map(c => (async() => {
        const primaryName = c.name.split(" ")[0];
        const commandID = await getCommandId(interaction, primaryName);

        commandsFormatted.push({
            ...c,
            primaryName,
            discordId: commandID
        });
    })());

    await Promise.all(commandsIdsPromises);

    const containerCommands = commandsFormatted.map(c => brBuilder(
        `### </${c.name}:${c.discordId}>`,
        `**Descrição**: \`${c.description}\``,
        `**Disponível**: \`${c.isAvaible ? "Sim" : "Não"}\``
    ));

    const categories = [...new Set(commands.map(c => c.category))];

    const container = createContainer(settings.colors.fuchsia,
        brBuilder(
            "# Comandos",
            `-# Categoria: \`${categoryFormatted[category] || category}\``
        ),
        createSeparator(),
        ...containerCommands,
        createSeparator(),
        `Página: \`${page}/${pages}\``,
        new StringSelectMenuBuilder({
            customId: `menu/help/commands/select/${category}/1`,
            placeholder: "Selecione uma categoria",
            options: categories.filter(c => c !== category).map(c => ({ label: categoryFormatted[c] || c, value: c }))
        }),
        createRow(
            new ButtonBuilder({
                customId: `menu/help/commands/page/${category}/${page - 1}`,
                style: ButtonStyle.Primary,
                emoji: "◀️",
                disabled: page === 1
            }),
            new ButtonBuilder({
                customId: `menu/help/commands/page/${category}/${page + 1}`,
                style: ButtonStyle.Primary,
                emoji: "▶️",
                disabled: page === pages
            }),
        )
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}