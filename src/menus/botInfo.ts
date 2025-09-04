import { icon } from "#functions";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, User, version, type InteractionReplyOptions, } from "discord.js";
import { existsSync, readFileSync } from "fs";
import si from 'systeminformation'

export async function botInfoMenu<R>(page: 'main' | 'hardware' | 'software' | 'curiosities', erisInfo: User, user: User): Promise<R> {
    const components: any[] = [];

    switch (page) {
        case "hardware": {
            const os = await import("os");

            const formatBytes = (bytes: number) => {
                const gb = bytes / (1024 ** 3);
                const mb = bytes / (1024 ** 2);
                return gb >= 1
                    ? `${gb.toFixed(2)} GB`
                    : `${mb.toFixed(2)} MB`;
            };
            

            async function getMemoryUsage() {
                const memory = await si.mem();
                return {
                    used: memory.active,
                    total: memory.total,
                    percent: Math.round((memory.active / memory.total) * 100)
                };
            }

            const memory = await getMemoryUsage();

            const cpu = os.cpus()[0];
            const cpuModel = cpu.model;
            const cpuSpeed = cpu.speed;
            const cpuCores = os.cpus().length;
            const cpuUsage = os.loadavg()[0];
            const cpuUsagePercent = Math.round(cpuUsage * 100);

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

            components.push(
                `# Olá ${user.username.replace(/([\\_*~`|>])/g, '\\$1')}, veja minhas informações abaixo! ${icon.Eris_happy_left}`,
                brBuilder(
                    `### ⚙️ Informações de uso`,
                    `> **Uso de memória do sistema:** ${formatBytes(memory.used)} — ${memory.percent}%`,
                    `> **Memória total do sistema:** ${formatBytes(memory.total)}`,
                    `> **Uso de memória da Eris:** ${formatBytes(erisRamUse)} — ${erisRamUsePercent}%`,
                    `> **Limite de memória do container:** ${formatBytes(containerRamLimit)}`,
                    `> **Uso de CPU:** ${cpuUsagePercent}%`,
                    `> **Modelo de CPU:** ${cpuModel}`,
                    `> **Velocidade da CPU:** ${cpuSpeed} MHz`,
                    `> **Núcleos:** ${cpuCores}`
                )
            )

            break;
        }
        case "software": {
            const os = await import("os");
            const djsVersion = version
            const magycianVersion = "1.4.6"
            const runtime = {
                name: process.versions.bun ? "bun": "node",
                version: process.versions.bun ?? process.versions.node,
            }

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

            components.push(
                `# Olá ${user.username.replace(/([\\_*~`|>])/g, '\\$1')}, veja minhas informações abaixo! ${icon.Eris_happy_left}`,
                brBuilder(
                    `### 🧠 Informações teóricas`,
                    `> **Versão do ${runtime.name}:** ${runtime.version}`,
                    `> **Versão do Discord.js:** ${djsVersion || "14.x.x"}`,
                    `> **Versão do Magycian Discord:** ${magycianVersion}`,
                    `> **Versão do Constatic:** 1.3.7`,
                    `> **Minha versão:** ${settings.bot.version}`,
                    `> **Sistema operacional:** ${getOSInfo()}`
                ),
            )
            break;
        }
        case "curiosities": {
            components.push(
                `# Olá ${user.username.replace(/([\\_*~`|>])/g, '\\$1')}, veja minhas informações abaixo! ${icon.Eris_happy_left}`,
                brBuilder(
                    `### Curiosidades`,
                    `- Minha desenvolvedora é o **Studio Styx**, comandado por **BirdTool**`,
                    `- Sou um bot de código aberto e meu código fonte está disponível no [GitHub](https://github.com/studio-styx/erisbot)`,
                    `- Uso o banco de dados PostgreSQL`,
                    `- Uso o banco de dados em memória **Redis**`,
                    `- Sabia que era pra eu ter originalmente sido feita em Kotlin? é possivel ver meu código antigo nos primeiros commits do meu github`,
                    `- Sou completamente hospedada pela [SquareCloud!](https://squarecloud.app/)`,
                    `- Você pode utilizar minha versão **canary** no nosso servidor principal! acesse-o apertando no botão abaixo`,
                    "- O meu servidor é uma **botlist**! você que é dev pode estar adicionando sua aplicação ao nosso servidor",
                    `- Sabia que agora eu possuo um website? você pode acessar ele em: **https://erisbot.squareweb.app/**`
                ),
            )
            break;
        }
        default: {
            components.push(
                createSection({
                    thumbnail: erisInfo.avatarURL()!,
                    content: brBuilder(
                        `# Olá ${user.username.replace(/([\\_*~`|>])/g, '\\$1')}, veja minhas informações abaixo! ${icon.Eris_happy_left}`,
                        "Sou uma bot de discord focada em economia e rpg, tenho vários recursos avançados, como entrevistas para emprego, investimentos e apostas!",
                        "Minha desenvolvedora é o **Studio Styx**, comandado por **BirdTool**",
                        "Meu site é **https://erisbot.squareweb.app/**",
                        "Selecione uma área para ver mais detalhes"
                    )
                }),
            )
            break;
        }
    }

    components.push(
        createSeparator(),
        createRow(
            new ButtonBuilder({
                customId: `botinfo/menu/hardware/${user.id}`,
                label: "Hardware",
                style: page === "hardware" ? ButtonStyle.Secondary : ButtonStyle.Primary,
                disabled: page === "hardware"
            }),
            new ButtonBuilder({
                customId: `botinfo/menu/software/${user.id}`,
                label: "Software",
                style: page === "software" ? ButtonStyle.Secondary : ButtonStyle.Primary,
                disabled: page === "software"
            }),
            new ButtonBuilder({
                customId: `botinfo/menu/curiosities/${user.id}`,
                label: "Curiosidades",
                style: page === "curiosities" ? ButtonStyle.Secondary : ButtonStyle.Primary,
                disabled: page === "curiosities"
            })
        )
    )

    const row = createRow(
        new ButtonBuilder({
            label: "Meu server",
            emoji: icon.rocket_launch,
            style: ButtonStyle.Link,
            url: "https://discord.gg/x8A5BHS369"
        })
    )

    const container = createContainer({
        accentColor: settings.colors.fuchsia,
        components,
    });

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container, row]
    } satisfies InteractionReplyOptions) as R;
}