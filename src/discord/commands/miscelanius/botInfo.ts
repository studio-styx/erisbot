import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder, version } from "discord.js";
import { brBuilder, createContainer, createSeparator } from "@magicyan/discord";
import { existsSync, readFileSync } from "fs";
import { settings } from "#settings";
import { menus } from "#menus";
import { getCommandId } from "#functions";

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
        const { user } = interaction
        switch (interaction.options.getSubcommand()) {
            case "info": {
                const os = await import("os");
                const djsVersion = version

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

                const runtime = {
                    name: process.versions.bun ? "bun": "node",
                    version: process.versions.bun ?? process.versions.node,
                }

                const processMemory = process.memoryUsage();
                const erisRamUse = processMemory.rss;

                let containerRamLimit = os.totalmem();

                try {
                    const limitStr = readFileSync("/sys/fs/cgroup/memory.max", "utf8").trim();
                    if (limitStr !== "max") {
                        containerRamLimit = parseInt(limitStr);
                    }
                } catch {
                    try {
                        const legacyLimitStr = readFileSync("/sys/fs/cgroup/memory/memory.limit_in_bytes", "utf8").trim();
                        containerRamLimit = parseInt(legacyLimitStr);
                    } catch {
                        // Ignora erro e mantém fallback
                    }
                }

                const erisRamUsePercent = Math.round((erisRamUse / containerRamLimit) * 100);

                const container = createContainer({
                    accentColor: "#a13d67",
                    components: [
                        `## Olá ${user.displayName}, veja minhas informações abaixo!`,
                        createSeparator(),
                        brBuilder(
                            `### Curiosidades`,
                            `- Minha desenvolvedora é o **Studio Styx**, comandado por **BirdTool**, saiba mais usando o comando \`/bot creators\``,
                            `- Sou um bot de código aberto e meu código fonte está disponível no [GitHub](https://github.com/studio-styx/erisbot)`,
                            `- Uso o banco de dados PostgreSQL hospedado pela [Neon](https://neon.com/)`,
                            `- Sabia que era pra eu ter originalmente sido feita em Kotlin? é possivel ver meu código antigo nos primeiros commits do meu github`,
                            `- Sou hospedada pela [Discloud!](https://beta.discloud.com/)`
                        ),
                        createSeparator(),
                        brBuilder(
                            `### 🧠 Informações teóricas`,
                            `> **Versão do ${runtime.name}:** ${runtime.version}`,
                            `> **Versão do Discord.js:** ${djsVersion || "14.x.x"}`,
                            `> **Versão do Constatic:** 1.2.6`,
                            `> **Minha versão:** ${settings.bot.version}`,
                            `> **Sistema operacional:** ${getOSInfo()}`
                        ),
                        createSeparator(),
                        brBuilder(
                            `### ⚙️ Informações de uso`,
                            `> **Uso de memória do sistema:** ${formatBytes(ramUse)} — ${ramUsePercent}%`,
                            `> **Memória total do sistema:** ${formatBytes(maxRam)}`,
                            `> **Uso de memória da Eris:** ${formatBytes(erisRamUse)} — ${erisRamUsePercent}%`,
                            `> **Limite de memória do container:** ${formatBytes(containerRamLimit)}`,
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
                try {
                    const embed = new EmbedBuilder({
                        description: "**Criadores**\nVeja a seguir os participantes do Studio Styx",
                        fields: [
                            { name: "", value: "**BirdTool**\n-# ╰ Desenvolvedor", inline: true },
                            { name: "", value: "**Santos**\n-# ╰ Designer", inline: true },
                            { name: "", value: "**Lay**\n-# ╰ Designer e tradutora", inline: false }
                        ],
                        color: 0x791b1b
                    });

                    await interaction.reply({
                        flags: ["Ephemeral"],
                        embeds: [embed]
                    });
                } catch (error: unknown) {
                    console.log(error);
                    await interaction.reply({
                        flags: ["Ephemeral"],
                        content: `Ocorreu um erro ao tentar enviar a mensagem: ${error instanceof Error ? error.message : String(error)}`
                    });
                }
                return;
            }
            case "commands": {
                const commandId = await getCommandId(interaction, "bot")

                interaction.reply(await menus.commands(commandId, "bot", interaction))
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
