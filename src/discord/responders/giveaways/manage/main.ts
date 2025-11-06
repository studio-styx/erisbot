import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { getBrazilTime, getMutualGuilds, icon, res, resv2 } from "#functions";
import { menus } from "#menus";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";
import { brBuilder, createLabel, createModalFields } from "@magicyan/discord";
import { ContainerComponent, TextDisplayComponent, TextInputBuilder, TextInputStyle } from "discord.js";

createResponder({
    customId: "giveaway/manage/main/:userId/:part",
    types: [ResponderType.StringSelect, ResponderType.ModalComponent], cache: "cached",
    parse(params) {
        return {
            userId: params.userId,
            part: params.part as "title" | "description" | "expiresAt" | "xpRequired" | "winners",
        }
    },
    async run(interaction, { userId, part }) {
        const { user, message } = interaction;
        if (user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando!`))
            return;
        }

        const key = `giveaway:manage:${message.id}`;

        if (interaction.isStringSelectMenu()) {
            const option = interaction.values[0];

            const fieldMap: Record<string, {
                field: string;       // o texto que aparece depois de ###
                label: string;       // o rótulo exibido no modal
                placeholder?: string;
                maxLength?: number;
                style?: TextInputStyle;
            }> = {
                title: {
                    field: "Título",
                    label: "Título",
                    placeholder: "sorteio de 1... sonhos...",
                    maxLength: 70,
                    style: TextInputStyle.Short,
                },
                description: {
                    field: "Descrição",
                    label: "Descrição",
                    placeholder: "o ganhador ganhará ...",
                    maxLength: 400,
                    style: TextInputStyle.Paragraph,
                },
                channelId: {
                    field: "Canal do sorteio",
                    label: "Canal do sorteio",
                },
                blacklistRoles: {
                    field: "Cargos de BlackList",
                    label: "Cargos de BlackList",
                },
                xpRequired: {
                    field: "Xp exigido",
                    label: "Xp exigido",
                    placeholder: "5000",
                    maxLength: 50,
                    style: TextInputStyle.Short,
                },
                roleEntries: {
                    field: "Multiplas entradas",
                    label: "Multiplas entradas",
                },
                expiresAt: {
                    field: "Expira em",
                    label: "Termina em",
                    placeholder: "ex: (13/07/2023 15:00), (24h)",
                    maxLength: 50,
                    style: TextInputStyle.Short,
                },
                connectedGuilds: {
                    field: "Servers conectados",
                    label: "Servers conectados",
                },
                stayInServerRequire: {
                    field: "É necessário estar em todos os servers para participar do sorteio?",
                    label: "Requisito de servers",
                },
                winners: {
                    field: "Quantidade de ganhadores",
                    label: "Ganhadores",
                    placeholder: "3",
                    maxLength: 50,
                    style: TextInputStyle.Short,
                },
            };

            const getValue = (field: string, content: string): string | null => {
                const regex = new RegExp(`### ${field}:\\s*([\\s\\S]*?)(?=###|$)`, "i");
                const match = content.match(regex);
                return match ? match[1].trim() : null;
            };


            const component = (message.components[0] as ContainerComponent).components[2] as TextDisplayComponent;
            const content = component.content;

            if (option !== "channelId" && option !== "blacklistRoles" && option !== "roleEntries" && option !== "connectedGuilds" && option !== "stayInServerRequire") {
                const config = fieldMap[option];
                const value = config ? getValue(config.field, content) : undefined;

                interaction.showModal({
                    customId: `giveaway/manage/main/${userId}/${option}`,
                    title: config?.label ?? option,
                    components: createModalFields(
                        createLabel({
                            label: `${config?.label ?? option} do sorteio`,
                            component: new TextInputBuilder({
                                customId: "response",
                                placeholder: config?.placeholder ?? "...",
                                style: config?.style ?? TextInputStyle.Short,
                                required: true,
                                minLength: 1,
                                maxLength: config?.maxLength ?? 50,
                                value: value ? value.length < 1 ? undefined : value : undefined
                            })
                        })
                    ),
                });

                return;
            } else if (option === "stayInServerRequire") {
                await interaction.deferUpdate();

                const raw = await redis.get(key);
                if (!raw) {
                    interaction.editReply(resv2.danger(`${icon.Eris_cry} | Parece que você demorou demais para setar as configurações do sorteio! as informações sobre o sorteio sumiram!`));
                    return;
                }
                const giveawayData = JSON.parse(raw, (key, value) => {
                    // Converte strings de data de volta para objetos Date
                    if (key === 'expiresAt' && typeof value === 'string') {
                        return new Date(value);
                    }
                    return value;
                }) as GiveawayManageDataInfo;

                if (!giveawayData.connectedGuilds || giveawayData.connectedGuilds.length < 1) {
                    interaction.followUp(res.danger(`${icon.error} | Para definir o requisito **\`"Precisa estar em todos os server"\`** é necessário primeiro definir os servidores conectados!`))
                    return;
                }

                giveawayData.stayInServerRequire = (giveawayData.stayInServerRequire === undefined || giveawayData.stayInServerRequire === false) ? true : false;

                await redis.setex(key, 3600, JSON.stringify({
                    ...giveawayData,
                    expiresAt: giveawayData.expiresAt?.toISOString() // Converte Date para string
                }));

                interaction.editReply(menus.giveaway.giveawayManage(userId, giveawayData, "main"))
                return;
            } else if (option === "connectedGuilds") {
                await interaction.deferUpdate();
                const raw = await redis.get(key);
                if (!raw) {
                    interaction.editReply(resv2.danger(`${icon.Eris_cry} | Parece que você demorou demais para setar as configurações do sorteio! as informações sobre o sorteio sumiram!`));
                    return;
                }
                const giveawayData = JSON.parse(raw, (key, value) => {
                    // Converte strings de data de volta para objetos Date
                    if (key === 'expiresAt' && typeof value === 'string') {
                        return new Date(value);
                    }
                    return value;
                }) as GiveawayManageDataInfo;
                const mutualGuilds = (await getMutualGuilds(interaction.client, userId)).filter(g => g.id !== interaction.guild.id);

                if (mutualGuilds.length < 1) {
                    interaction.followUp(res.danger(`${icon.error} | Não tem servers onde você e eu estamos ao mesmo tempo sem ser esse!`))
                    return;
                }

                interaction.editReply(menus.giveaway.giveawayManage(userId, giveawayData, "connectedGuilds", 0, mutualGuilds))
                return;
            } else {
                await interaction.deferUpdate();

                const raw = await redis.get(key);
                if (!raw) {
                    interaction.editReply(resv2.danger(`${icon.Eris_cry} | Parece que você demorou demais para setar as configurações do sorteio! as informações sobre o sorteio sumiram!`));
                    return;
                }
                const giveawayData = JSON.parse(raw, (key, value) => {
                    if (key === 'expiresAt' && typeof value === 'string') {
                        return new Date(value);
                    }
                    return value;
                }) as GiveawayManageDataInfo;

                interaction.editReply(menus.giveaway.giveawayManage(userId, giveawayData, option))
                return;
            }
        } else {
            function parseXpRequired(input: string): number | null {
                const value = Number(input);
                if (isNaN(value) || value < 30) return null;
                return value;
            }

            function parseExpiresAt(input: string): Date | null {
                input = input.trim().toLowerCase();
                const now = getBrazilTime(); // ← horário de Brasília
                const maxFuture = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

                // === ABSOLUTO: dd/mm/yyyy HH:mm ===
                let match = input.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(\d{1,2}):(\d{2})$/);
                if (match) {
                    const [, d, m, y, h, min] = match.map(Number);
                    const date = createBrazilDate(y, m - 1, d, h, min);
                    if (date > now && date <= maxFuture) return date;
                    return null;
                }

                // === ABSOLUTO: dd/mm HH:mm ===
                match = input.match(/^(\d{1,2})[\/\-](\d{1,2})\s+(\d{1,2}):(\d{2})$/);
                if (match) {
                    const [, d, m, h, min] = match.map(Number);
                    const date = createBrazilDate(now.getFullYear(), m - 1, d, h, min);
                    if (date > now && date <= maxFuture) return date;
                    return null;
                }

                // === DATA: dd/mm (12:00) ===
                match = input.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
                if (match) {
                    const [, d, m] = match.map(Number);
                    const date = createBrazilDate(now.getFullYear(), m - 1, d, 12, 0);
                    if (date > now && date <= maxFuture) return date;
                    return null;
                }

                // === HORÁRIO: 20:00 (hoje ou amanhã) ===
                const timeMatch = input.match(/^(\d{1,2}):(\d{2})$/);
                if (timeMatch) {
                    const [, h, min] = timeMatch.map(Number);
                    let date = createBrazilDate(now.getFullYear(), now.getMonth(), now.getDate(), h, min);
                    if (date <= now) {
                        date = new Date(date.getTime() + 24 * 60 * 60 * 1000); // amanhã
                    }
                    if (date > now && date <= maxFuture) return date;
                    return null;
                }

                // === RELATIVO: 20m, 2h, 3d ===
                const relPattern = /(\d+)\s*(h|hora|horas|m|min|minuto|minutos|d|dia|dias|w|semana|semanas)/g;
                let totalMs = 0;
                let relMatch: RegExpExecArray | null;
                while ((relMatch = relPattern.exec(input)) !== null) {
                    const value = Number(relMatch[1]);
                    const unit = relMatch[2];
                    switch (unit) {
                        case "h": case "hora": case "horas": totalMs += value * 3600000; break;
                        case "m": case "min": case "minuto": case "minutos": totalMs += value * 60000; break;
                        case "d": case "dia": case "dias": totalMs += value * 86400000; break;
                        case "w": case "semana": case "semanas": totalMs += value * 604800000; break;
                    }
                }
                if (totalMs > 0) {
                    const date = new Date(now.getTime() + totalMs);
                    if (date > now && date <= maxFuture) return date;
                    return null;
                }

                return null;
            }

            function parseWinnersRequired(input: string): number | null {
                const value = Number(input);
                if (isNaN(value) || value < 1) return null;
                return value;
            }
            let response: string | number | Date = interaction.fields.getTextInputValue("response");

            let formatted: string | number | Date | null = null;

            switch (part) {
                case "xpRequired":
                    formatted = parseXpRequired(response);
                    break;
                case "winners":
                    formatted = parseWinnersRequired(response)
                    break;
                case "expiresAt":
                    formatted = parseExpiresAt(response);
                    break;

                case "title":
                case "description":
                    formatted = response.trim();
                    break;
            }

            if (formatted === null) {
                if (part === "xpRequired") {
                    interaction.reply(res.danger(`${icon.error} | Você precisa digitar um número válido maior que **30**!`))
                    return;
                }
                if (part === "expiresAt") {
                    interaction.reply(res.danger(brBuilder(
                        `${icon.error} | Digite uma data válida! aqui está todos os exemplos de datas válidas:`,
                        "**15/10** -> dia 15 do mês 10 no horário 12:00",
                        "**15/10/2026** -> dia 15 do mês 10 do ano de 2026",
                        "**15/10 17:50** -> dia 15 do mês 10 no horário 17:50",
                        "**3h** -> sorteio acaba daqui 3 horas",
                        "**3 horas** -> mesma coisa do anterior mas sem abreviação",
                        "-# Se você digitou uma data correta, verifique-se a data está no passado, ou se excede o limite de 30 dias, nenhum sorteio pode ter mais que 30 dias de duração."
                    )))
                    return;
                }
                if (part === "winners") {
                    interaction.reply(res.danger(`${icon.error} | Você precisa definir um número válido acima de 1!`))
                    return;
                }
            }

            await interaction.deferUpdate();

            const raw = await redis.get(key);
            if (!raw) {
                interaction.editReply(resv2.danger(`${icon.Eris_cry} | Parece que você demorou demais para setar as configurações do sorteio! as informações sobre o sorteio sumiram!`));
                return;
            }
            const giveawayData = JSON.parse(raw, (key, value) => {
                if (key === 'expiresAt' && typeof value === 'string') {
                    return new Date(value);
                }
                return value;
            }) as GiveawayManageDataInfo;

            switch (part) {
                case "title": {
                    giveawayData.title = formatted as string;
                    break;
                }
                case "description": {
                    giveawayData.description = formatted as string;
                    break;
                }
                case "expiresAt": {
                    giveawayData.expiresAt = formatted as Date;
                    break;
                }
                case "xpRequired": {
                    const isEnabled = (await prisma.guildSettings.findUnique({
                        where: { id: interaction.guildId },
                        select: { xpSystemEnabled: true }
                    }))?.xpSystemEnabled;

                    if (!isEnabled) {
                        interaction.followUp(res.danger(`${icon.error} | O sistema de xp precisa estar ativado para definir o xp!`))
                        return;
                    }
                    giveawayData.xpRequired = formatted as number;
                    break;
                }
                case "winners": {
                    giveawayData.winners = formatted as number;
                    break;
                }
            }

            await redis.setex(key, 3600, JSON.stringify({
                ...giveawayData,
                expiresAt: giveawayData.expiresAt?.toISOString() // Converte Date para string
            }));
            interaction.editReply(menus.giveaway.giveawayManage(userId, giveawayData, "main"));
            return
        }
    },
});

function createBrazilDate(
    year: number, month: number, day: number,
    hours: number, minutes: number
): Date {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T` +
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00-03:00`;
    return new Date(iso); // já está em UTC internamente
}