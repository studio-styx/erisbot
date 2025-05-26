import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import i18next from "i18next";
import { menus } from "#menus";
import { getCommandId } from "#utils";
import { existsSync, readFileSync } from "fs";

createCommand({
    name: "bot",
    description: "bot commands",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "info",
            description: "Get information about the bot",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "info",
                "en-US": "info",
                "es-ES": "info",
            },
            descriptionLocalizations: {
                "pt-BR": "Obter informações sobre o bot",
                "en-US": "Get information about the bot",
                "es-ES": "Obtener información sobre el bot",
            }
        },
        {
            name: "creators",
            description: "Get information about the Studio Styx",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "criadores",
                "en-US": "creators",
                "es-ES": "creadores",
            },
            descriptionLocalizations: {
                "pt-BR": "Obter informações sobre o Studio Styx",
                "en-US": "Get information about the Studio Styx",
                "es-ES": "Obtener información sobre el Studio Styx",
            }
        },
        {
            name: "commands",
            description: "Get commands from the bot",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "comandos",
                "en-US": "commands",
                "es-ES": "comandos",
            },
            descriptionLocalizations: {
                "pt-BR": "Obter comandos do bot",
                "en-US": "Get commands from the bot",
                "es-ES": "Obtener comandos"
            }
        },
        {
            name: "ping",
            description: "Get the ping from the bot",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "ping",
                "en-US": "ping",
                "es-ES": "ping",
            },
            descriptionLocalizations: {
                "pt-BR": "Obter o ping do bot",
                "en-US": "Get the ping from the bot",
                "es-ES": "Obtener el ping del bot",
            }
        }
    ],
    nameLocalizations: {
        "pt-BR": "bot",
        "en-US": "bot",
        "es-ES": "bot",
    },
    descriptionLocalizations: {
        "pt-BR": "Comandos do bot",
        "en-US": "Bot commands",
        "es-ES": "Comandos del bot",
    },
    async run(interaction) {
        await i18next.changeLanguage(interaction.locale);
        const { user } = interaction
        switch (interaction.options.getSubcommand()) {
            case "info": {
                const os = await import("os");
                const djsVersion = require("discord.js").version || "14.x.x";

                const formatBytes = (bytes: number) => {
                    const gb = bytes / (1024 ** 3);
                    const mb = bytes / (1024 ** 2);
                    return gb >= 1
                        ? `${gb.toFixed(2)} GB`
                        : `${mb.toFixed(2)} MB`;
                };

                const ramUse = os.totalmem() - os.freemem();
                const maxRam = os.totalmem();
                const ramUsePercent = Math.round((ramUse / maxRam) * 100);

                const cpu = os.cpus()[0];
                const cpuModel = cpu.model;
                const cpuSpeed = cpu.speed;
                const cpuCores = os.cpus().length;
                const cpuUsage = os.loadavg()[0];
                const cpuUsagePercent = Math.round(cpuUsage * 100);

                function getOSInfo(): string {
                    const platform = os.platform();
                    const arch = os.arch();

                    if (platform === "win32") {
                        return `Windows ${arch}`;
                    }

                    if (platform === "darwin") {
                        return `macOS ${arch}`;
                    }

                    if (platform === "linux") {
                        const osReleasePath = "/etc/os-release";
                        if (existsSync(osReleasePath)) {
                            const content = readFileSync(osReleasePath, "utf8");
                            const nameMatch = content.match(/^NAME="?(.*)"?$/m);
                            const versionMatch = content.match(/^VERSION="?(.*)"?$/m);
                            const distro = nameMatch?.[1] ?? "Linux";
                            const version = versionMatch?.[1] ?? "";
                            return `${distro} ${version} ${arch}`;
                        }

                        return `Linux ${arch}`;
                    }

                    return `Desconhecido (${platform} ${arch})`;
                }

                const container = createContainer({
                    accentColor: "#a13d67",
                    components: [
                        `## Olá ${user.displayName}, veja minhas informações abaixo!`,
                        createSeparator(),
                        brBuilder(
                            `### Curiosidades`,
                            `- Fui feita com TypeScript e [bun](https://bun.sh/) (runtime concorrente do node), mas era pra eu ter sido feita originalmente com Kotlin e JDA`,
                            `- Minha desenvolvedora é o **Studio Styx**, comandado por **BirdTool**, saiba mais usando o comando \`/bot creators\``,
                            `- Sou um bot de código aberto e meu código fonte está disponível no [GitHub](https://github.com/studio-styx/erisbot)`,
                            `- Uso o banco de dados PostgreSQL hospedado pela [Supabase](https://supabase.com/)`,
                            `- Sou hospedada pelo **Styx host** uma hospedagem própria do Studio Styx!`
                        ),
                        createSeparator(),
                        brBuilder(
                            `### 🧠 Informações teóricas`,
                            `> **Versão do Bun:** ${process.versions.bun || "1.2.x"}`,
                            `> **Versão do Discord.js:** ${djsVersion || "14.x.x"}`,
                            `> **Versão do Constatic:** 1.2.6`,
                            `> **Minha versão:** 0.3.5-beta2`,
                            `> **Sistema operacional:** ${getOSInfo()}`
                        ),
                        createSeparator(),
                        brBuilder(
                            `### ⚙️ Informações de uso`,
                            `> **Uso de memória:** ${formatBytes(ramUse)} — ${ramUsePercent}%`,
                            `> **Memória total:** ${formatBytes(maxRam)}`,
                            `> **Uso de CPU:** ${cpuUsagePercent}%`,
                            `> **Modelo de CPU:** ${cpuModel}`,
                            `> **Velocidade da CPU:** ${cpuSpeed} MHz`,
                            `> **Núcleos:** ${cpuCores}`
                        )
                    ]
                });

                interaction.reply({
                    flags: ["IsComponentsV2"],
                    components: [container]
                });
                return;
            }

            case "creators": {
                const t = (key: string) => i18next.t(`commands/botInfo:creators.${key}`);

                try {
                    const embed = new EmbedBuilder({
                        description: t("title"),
                        fields: [
                            { name: "", value: t("birdtool"), inline: true },
                            { name: "", value: t("santos"), inline: true },
                            { name: "", value: t("lay"), inline: false }
                        ],
                        color: 0x791b1b
                    });

                    await interaction.reply({
                        flags: ["Ephemeral"],
                        embeds: [embed]
                    });
                } catch {
                    // fallback em texto plano
                    await interaction.reply({
                        flags: ["Ephemeral"],
                        content: [
                            `**${t("title")}**`,
                            t("birdtool"),
                            t("santos"),
                            t("lay")
                        ].join("\n")
                    });
                }
                return;
            }
            case "commands": {
                const commandId = await getCommandId(interaction, "bot")

                interaction.reply(menus.commands(commandId, "bot"))
                return;
            }
            case "ping": {
                const start = Date.now();
                await interaction.deferReply({ flags });

                const apiPing = interaction.client.ws.ping < 1 ? 0 : interaction.client.ws.ping;
                const botPing = Date.now() - start;

                try {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder({
                                title: "🏓 Ping",
                                description: `**Ping do Bot:** ${botPing}ms\n**Ping da API:** ${apiPing}ms`,
                                color: 0x1f3baa
                            })
                        ]
                    });
                } catch {
                    await interaction.editReply(
                        `🏓 **Ping do Bot:** ${botPing}ms\n**Ping da API:** ${apiPing}ms`
                    );
                }

                return;
            }
        }
    }
});
