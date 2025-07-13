import { createResponder, ResponderType } from "#base";
import { generateGeminiContent } from "functions/logic/index.js";
import { PrismaClient } from "#prisma/client";
import { icon, res } from "functions/utils/index.js";
import { brBuilder } from "@magicyan/discord";
import { time } from "discord.js";

const prisma = new PrismaClient();

createResponder({
    customId: "investment/advancedAvaliation/:stockId",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { stockId }) {
        await interaction.deferReply({ flags });

        const requisitionsReamig = await prisma.log.findMany({
            where: {
                userId: interaction.user.id,
                timestamp: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                },
                type: "RequisitionToAI",
            },
        });

        if (requisitionsReamig.length > 4) {
            const oldestRequisition = requisitionsReamig.reduce((oldest, current) =>
                current.timestamp < oldest.timestamp ? current : oldest
            );

            const expiryDate = new Date(oldestRequisition.timestamp.getTime() + 24 * 60 * 60 * 1000);

            const expiryUnix = Math.floor(expiryDate.getTime() / 1000);

            interaction.editReply(res.danger(`${icon.denied} | Você atingiu o limite de requisições diárias. Você pode tentar novamente <t:${expiryUnix}:R>`));
            return;
        }

        const stock = await prisma.stock.findUnique({
            where: {
                id: Number(stockId),
            },
            include: {
                history: {
                    orderBy: {
                        date: "desc",
                    },
                },
            }
        })

        if (!stock) {
            interaction.editReply("Ação não encontrada.");
            return;
        }

        await interaction.editReply(res.warning(`${icon.waiting_white} | Aguardando resposta da IA...`));

        const prompt = brBuilder(
            `Você é um analista de investimentos especializado em avaliar ações da bolsa.`,
            `Seu objetivo agora é analisar a ação **${stock.name}** (ID: ${stock.id}).`,
            `O preço atual da ação é R$${stock.price}.`,
            `Histórico de preços: ${stock.history.map((history) => `R$${history.price} em ${time(history.date, "R")}`).join(", ")}.`,
            `Descrição da ação: ${stock.description || "Não há descrição disponível."}`,
            `Avaliação mais recente: ${stock.iaAvaliation || "Ainda não foi avaliada."}`,
            `Com base nessas informações, diga se essa ação é uma boa compra ou não neste momento.`,
            `Explique seu raciocínio de forma clara e acessível para que o usuário ${interaction.user.displayName} possa entender, mesmo que não tenha conhecimento técnico avançado.`
        );

        try {
            const result = await generateGeminiContent(prompt);
            if (!result.success || !result.text) {
                console.error("Erro ao gerar conteúdo:", result);
                interaction.editReply(res.danger("Ocorreu um erro ao processar a solicitação. Tente novamente mais tarde."));
                return;
            }

            const { text: avaliation } = result;

            await prisma.log.create({
                data: {
                    userId: interaction.user.id,
                    type: "RequisitionToAI",
                    timestamp: new Date(),
                    message: `Pediu a IA para avaliar a ação ${stock.name} (ID: ${stock.id})`,
                    level: 3,
                },
            });

            interaction.editReply(res.success(`A avaliação da ação ${stock.name} (ID: ${stock.id}) foi avaliada pela IA, veja abaixo a avaliação:\n\n**${avaliation}**`))
        } catch (error) {
            console.error("Erro ao gerar conteúdo:", error);
            interaction.editReply(res.danger("Ocorreu um erro ao processar a solicitação. Tente novamente mais tarde."));
            return;
        }

    },
});