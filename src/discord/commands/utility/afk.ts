import { createCommand } from "#base";
import { prisma, redis } from "#database";
import { getCommandId, icon, res } from "#functions";
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, time } from "discord.js";

createCommand({
    name: "afk",
    description: "defines your afk status",
    type: ApplicationCommandType.ChatInput,
    nameLocalizations: {
        "en-US": "afk",
        "pt-BR": "afk",
        "es-ES": "afk"
    },
    descriptionLocalizations: {
        "en-US": "defines your afk status",
        "pt-BR": "define seu status afk",
        "es-ES": "define su estado afk"
    },
    options: [
        {
            name: "set",
            description: "set's your afk status",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "en-US": "set",
                "pt-BR": "setar",
                "es-ES": "set"
            },
            descriptionLocalizations: {
                "en-US": "set's your afk status",
                "pt-BR": "seta seu status de afk",
                "es-ES": "set'a su estado afk"
            },
            options: [
                {
                    name: "reason",
                    description: "your reasson for being afk",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    nameLocalizations: {
                        "en-US": "reason",
                        "pt-BR": "motivo",
                        "es-ES": "razón"
                    },
                    descriptionLocalizations: {
                        "en-US": "your reasson for being afk",
                        "pt-BR": "seu motivo para estar afk",
                        "es-ES": "su razón para estar afk"
                    }
                }
            ]
        },
        {
            name: "remove",
            description: "remove you from afk",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "en-US": "remove",
                "pt-BR": "remover",
                "es-ES": "remover"
            },
            descriptionLocalizations: {
                "en-US": "remove you from afk",
                "pt-BR": "remove você do afk",
                "es-ES": "remove de afk"
            }
        }
    ],
    async run(interaction) {
        switch (interaction.options.getSubcommand()) {
            case "set": {
                const reason = interaction.options.getString("reason") || "Não definido";

                await interaction.deferReply();
                const reasonFormatted = await formatReasonMentions(interaction, reason);

                const hasReplacement = reasonFormatted.replacements.length > 0;
                let text: string | null = null;
                if (hasReplacement) {
                    const replacement = reasonFormatted.replacements;

                    const mentions = [];
                    const mentionEveryone = replacement.some(r => r.type === "everyone");
                    replacement.some(r => r.type === "here") ? mentions.push("here") : null;


                    for (const r of replacement) {
                        if (r.type === "user" || r.type === "role") {
                            mentions.push(r.name);
                        }
                    }


                    mentionEveryone ? text = `Você tentou que eu marcasse everyone, mas não conseguiu! ${icon.Eris_trusting_left} ` : text = null;

                    if (mentions.length > 0) {
                        text = text
                            ? `${text} Além disso você achou que eu marcaria: ${mentions.map(m => `**${m}**`).join(", ")}, mas eu não sou tão inocente assim!`
                            : `Você tentou que eu marcasse: ${mentions.map(m => `**${m}**`).join(", ")}, mas não conseguiu! ${icon.Eris_trusting_left}`;
                    }
                }

                // salvar no redis e no banco
                // salvar no redis
                await redis.set(`afk:${interaction.user.id}`, JSON.stringify({
                    reason: reasonFormatted.text,
                    time: new Date()
                }));
                // salvar no banco
                await prisma.user.upsert({
                    where: {
                        id: interaction.user.id
                    },
                    create: {
                        id: interaction.user.id,
                        afkReasson: reasonFormatted.text,
                        afkTime: new Date()
                    },
                    update: {
                        afkReasson: reasonFormatted.text,
                        afkTime: new Date()
                    }
                })

                interaction.editReply(res.fuchsia(`${icon.success} | Você definiu seu afk como: **${reasonFormatted.text}**! ${text ? `\n${text}` : ""}`));
                return;
            }
            case "remove": {
                await interaction.deferReply();

                const redisAfk = await redis.get(`afk:${interaction.user.id}`);
                const prismaAfk = await prisma.user.findUnique({
                    where: {
                        id: interaction.user.id
                    },
                    select: {
                        afkReasson: true,
                        afkTime: true
                    }
                });

                if (!redisAfk && (!prismaAfk || !prismaAfk.afkReasson || !prismaAfk.afkTime)) {
                    const id = await getCommandId(interaction, "afk")
                    interaction.editReply(res.danger(`${icon.error} | Você não está afk! para definir seu afk use **</afk set:${id}>**`));
                    return;
                }

                if (redisAfk) await redis.del(`afk:${interaction.user.id}`);
                await prisma.user.update({
                    where: {
                        id: interaction.user.id
                    },
                    data: {
                        afkReasson: null,
                        afkTime: null
                    }
                });

                interaction.editReply(res.fuchsia(`${icon.success} | Você removeu seu afk! você esteve afk ${time(prismaAfk?.afkTime!, "R")}`));
                return;
            }
        }
    }
});
type Replacement =
    | { type: 'everyone' | 'here'; original: string; replacement: string }
    | { type: 'user' | 'role'; original: string; replacement: string; id: string; name: string };

const ZWSP = "\u200B";

// Neutraliza apenas ** e *; remove crases
function sanitizeFormatting(text: string): string {
    return text
        // remove TODAS as crases
        .replace(/`+/g, "")
        // quebra negrito (**)
        .replace(/\*\*/g, `*${ZWSP}*`)
        // quebra itálico simples (*)
        .replace(/\*/g, `*${ZWSP}`);
}

export async function formatReasonMentions(
    interaction: ChatInputCommandInteraction<"cached">,
    reason: string
): Promise<{ text: string; replacements: Replacement[] }> {
    const guild = interaction.guild;
    const mentionRegex = /@everyone|@here|<@!?(\d{17,20})>|<@&(\d{17,20})>/g;

    const replacements: Replacement[] = [];
    const userNameById = new Map<string, string>();
    const roleNameById = new Map<string, string>();

    let out = '';
    let last = 0;
    let m: RegExpExecArray | null;

    while ((m = mentionRegex.exec(reason)) !== null) {
        const [full] = m;
        out += reason.slice(last, m.index);
        let rep = full;

        if (full === '@everyone') {
            rep = '@' + ZWSP + 'everyone';
            replacements.push({ type: 'everyone', original: full, replacement: rep });
        } else if (full === '@here') {
            rep = '@' + ZWSP + 'here';
            replacements.push({ type: 'here', original: full, replacement: rep });
        } else if (m[1]) {
            const userId = m[1];
            let display = userNameById.get(userId);

            if (!display && guild) {
                const cached = guild.members.cache.get(userId);
                const member = cached ?? (await guild.members.fetch(userId).catch(() => null));
                if (member) {
                    display = `@${member.displayName ?? member.user.username}`;
                    userNameById.set(userId, display);
                }
            }

            rep = display ?? '@user';
            replacements.push({
                type: 'user',
                original: full,
                replacement: rep,
                id: userId,
                name: display ?? 'usuário',
            });
        } else if (m[2]) {
            const roleId = m[2];
            let name = roleNameById.get(roleId);

            if (!name && guild) {
                const role =
                    guild.roles.cache.get(roleId) ?? (await guild.roles.fetch(roleId).catch(() => null));
                if (role) {
                    name = `@${role.name}`;
                    roleNameById.set(roleId, name);
                }
            }

            rep = name ?? '@role';
            replacements.push({
                type: 'role',
                original: full,
                replacement: rep,
                id: roleId,
                name: name ?? 'cargo',
            });
        }

        out += rep;
        last = mentionRegex.lastIndex;
    }

    out += reason.slice(last);

    // aplica sanitização final
    const safeText = sanitizeFormatting(out);

    return { text: safeText, replacements };
}
