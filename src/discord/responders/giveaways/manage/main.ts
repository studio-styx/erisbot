import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { getMutualGuilds, icon, res, resv2 } from "#functions";
import { menus } from "#menus";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";
import { brBuilder, createModalFields } from "@magicyan/discord";
import { TextInputStyle } from "discord.js";

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
            if (option !== "channelId" && option !== "blacklistRoles" && option !== "roleEntries" && option !== "connectedGuilds" && option !== "stayInServerRequire") {
                interaction.showModal({
                    customId: `giveaway/manage/main/${userId}/${option}`,
                    title: option === "title"
                        ? "titulo"
                        : option === "description"
                            ? "descrição"
                            : option === "expiresAt"
                                ? "termina em"
                                : option === "xpRequired"
                                    ? "xp exigido"
                                    : option === "winners"
                                        ? "ganhadores"
                                        : option,
                    components: createModalFields({
                        response: {
                            label: (option === "title"
                                ? "titulo"
                                : option === "description"
                                    ? "descrição"
                                    : option === "expiresAt"
                                        ? "data de termino"
                                        : option === "xpRequired"
                                            ? "xp exigido"
                                            : option === "winners"
                                                ? "ganhadores"
                                                : option) + " do sorteio",
                            placeholder: option === "title"
                                ? "sorteio de 1... sonhos..."
                                : option === "description"
                                    ? "o ganhador ganhará ..."
                                    : option === "expiresAt"
                                        ? "ex: (13/07/2023 15:00), (24h)"
                                        : option === "xpRequired"
                                            ? "5000"
                                            : option === "winners"
                                                ? "3"
                                                : option,
                            style: option === "description" ? TextInputStyle.Paragraph : TextInputStyle.Short,
                            required: true,
                            minLength: 1,
                            maxLength: option === "title"
                                ? 70
                                : option === "description"
                                    ? 300
                                    : 50
                        },
                    }),
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

                // Offset fixo para Brasil (UTC-3 em ms)
                const brazilOffsetMs = -3 * 60 * 60 * 1000;

                // Now ajustado para Brasil
                const now = new Date(Date.now() + brazilOffsetMs);
                const maxFuture = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias

                // Formato absoluto: dd/mm/yyyy HH:mm
                let absMatch = input.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(\d{1,2}):(\d{2})$/);
                if (absMatch) {
                    const [, d, m, y, h, min] = absMatch.map(Number);
                    let date = new Date(y, m - 1, d, h, min);
                    date = new Date(date.getTime() + brazilOffsetMs); // Ajusta para Brasil
                    if (date > now && date <= maxFuture) return new Date(date.getTime() - brazilOffsetMs); // Retorna em UTC para salvar
                    return null;
                }

                // Formato absoluto sem ano: dd/mm HH:mm
                absMatch = input.match(/^(\d{1,2})[\/\-](\d{1,2})\s+(\d{1,2}):(\d{2})$/);
                if (absMatch) {
                    const [, d, m, h, min] = absMatch.map(Number);
                    let date = new Date(now.getFullYear(), m - 1, d, h, min);
                    date = new Date(date.getTime() + brazilOffsetMs);
                    if (date > now && date <= maxFuture) return new Date(date.getTime() - brazilOffsetMs);
                    return null;
                }

                // Formato absoluto sem ano e sem hora: dd/mm (assume 12:00)
                absMatch = input.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
                if (absMatch) {
                    const [, d, m] = absMatch.map(Number);
                    let date = new Date(now.getFullYear(), m - 1, d, 12, 0);
                    date = new Date(date.getTime() + brazilOffsetMs);
                    if (date > now && date <= maxFuture) return new Date(date.getTime() - brazilOffsetMs);
                    return null;
                }

                // Apenas horário do dia (ex: 18:20 ou 00:00)
                const timeMatch = input.match(/^(\d{1,2}):(\d{2})$/);
                if (timeMatch) {
                    const [, h, min] = timeMatch.map(Number);
                    let date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, min);
                    if (date <= now) {
                        date.setDate(date.getDate() + 1);
                    }
                    date = new Date(date.getTime() + brazilOffsetMs);
                    if (date > now && date <= maxFuture) return new Date(date.getTime() - brazilOffsetMs);
                    return null;
                }

                // Relativos: múltiplos blocos (com ou sem espaço)
                const relPattern = /(\d+)\s*(h|hora|horas|m|min|minuto|minutos|d|dia|dias|w|semana|semanas)/g;
                let totalMs = 0;
                let match: RegExpExecArray | null;

                while ((match = relPattern.exec(input)) !== null) {
                    const value = Number(match[1]);
                    const unit = match[2];
                    switch (unit) {
                        case "h": case "hora": case "horas":
                            totalMs += value * 60 * 60 * 1000; break;
                        case "m": case "min": case "minuto": case "minutos":
                            totalMs += value * 60 * 1000; break;
                        case "d": case "dia": case "dias":
                            totalMs += value * 24 * 60 * 60 * 1000; break;
                        case "w": case "semana": case "semanas":
                            totalMs += value * 7 * 24 * 60 * 1000; break;
                    }
                }

                if (totalMs > 0) {
                    const date = new Date(now.getTime() + totalMs);
                    if (date > now && date <= maxFuture) return new Date(date.getTime() - brazilOffsetMs); // Retorna em UTC
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