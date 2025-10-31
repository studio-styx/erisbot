import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { createLabel, createModalFields } from "@magicyan/discord";
import { StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import z from "zod";

createResponder({
    customId: "football/menu/date/:date",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            date: new Date(params.date)
        }
    },
    async run(interaction, { date }) {
        await interaction.deferUpdate();

        const dateTo = new Date(date);
        dateTo.setHours(23, 59, 59, 999);


        const matches = await prisma.footballMatch.findMany({
            where: {
                startAt: {
                    gte: date,
                    lte: dateTo
                }
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                competition: true
            },
            orderBy: [
                { competition: { name: "asc" } },
                { startAt: "asc" }
            ]
        });

        await interaction.editReply(menus.football.matches.matchesMenu(matches, interaction.user.displayAvatarURL(), date))
    },
});

createResponder({
    customId: "football/menu/other/otherData",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    async run(interaction) {
        if (interaction.isButton()) {
            await interaction.showModal({
                customId: "football/menu/other/otherData",
                title: "Escolha uma data",
                components: createModalFields(
                    createLabel({
                        label: "Dia do mês",
                        component: new TextInputBuilder({
                            customId: "day",
                            style: TextInputStyle.Short,
                            required: true,
                            placeholder: "Digite o dia do mês para ver as partidas",
                            maxLength: 2
                        })
                    }),
                    createLabel({
                        label: "Mês do ano",
                        component: new StringSelectMenuBuilder({
                            customId: "month",
                            placeholder: "Escolha o mês do ano",
                            required: true,
                            options: [
                                { label: "Janeiro", value: "0" },
                                { label: "Fevereiro", value: "1" },
                                { label: "Março", value: "2" },
                                { label: "Abril", value: "3" },
                                { label: "Maio", value: "4" },
                                { label: "Junho", value: "5" },
                                { label: "Julho", value: "6" },
                                { label: "Agosto", value: "7" },
                                { label: "Setembro", value: "8" },
                                { label: "Outubro", value: "9" },
                                { label: "Novembro", value: "10" },
                                { label: "Dezembro", value: "11" },
                            ]
                        })
                    })
                )
            })
            return;
        } else {
            const day = interaction.fields.getTextInputValue("day");
            const month = interaction.fields.getStringSelectValues("month")[0];

            const daySchema = z.coerce.number("Você precisa informar um dia válido")
                .min(1, "Você precisa informar um dia maior que 0")
                .max(31, "Você precisa informar um dia menor que 31");

            const dayParsed = daySchema.safeParse(day);

            if (!dayParsed.success) {
                await interaction.reply(res.danger(`${icon.error} | ${dayParsed.error.issues.map(i => i.message).join(", ")}`))
                return;
            }
            
            const date = new Date();
            date.setDate(dayParsed.data);
            date.setMonth(parseInt(month));
            
            const dateFrom = new Date(date);
            dateFrom.setHours(0, 0, 0, 0);
            
            const dateTo = new Date(date);
            dateTo.setHours(23, 59, 59, 999);
            
            await interaction.deferUpdate();

            const matches = await prisma.footballMatch.findMany({
                where: {
                    startAt: {
                        gte: date,
                        lte: dateTo
                    }
                },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                    competition: true
                },
                orderBy: [
                    { competition: { name: "asc" } },
                    { startAt: "asc" }
                ]
            });

            if (matches.length === 0) {
                await interaction.followUp(res.danger(`${icon.Eris_cry} | Eu não consegui encontrar jogos nessa data!`))
                return;
            }

            await interaction.editReply(menus.football.matches.matchesMenu(matches, interaction.user.displayAvatarURL(), date))
            return;
        }
    },
});

createResponder({
    customId: "football/menu/page/:page/:date",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            page: parseInt(params.page),
            date: new Date(params.date)
        }
    },
    async run(interaction, { date, page }) {
        await interaction.deferUpdate();
      
        const dateFrom = new Date(date);
        dateFrom.setHours(0, 0, 0, 0);

        const dateTo = new Date(date);
        dateTo.setHours(23, 59, 59, 999);


        const matches = await prisma.footballMatch.findMany({
            where: {
                startAt: {
                    gte: dateFrom,
                    lte: dateTo
                }
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                competition: true
            },
            orderBy: [
                { competition: { name: "asc" } },
                { startAt: "asc" }
            ]
        });

        await interaction.editReply(menus.football.matches.matchesMenu(matches, interaction.user.displayAvatarURL(), date, page));
        return;
    },
});