import { prisma } from "#database";
import { res, icon, generateGeminiContent } from "#functions";
import { brBuilder } from "@magicyan/discord";
import { ChatInputCommandInteraction } from "discord.js";

export async function iaAvaliationCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options, user: author } = interaction;

    await interaction.deferReply();

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


    await interaction.editReply(res.warning(`${icon.waiting_white} | Aguardando resposta da IA...`));

    const stocks = await prisma.stock.findMany({
        orderBy: {
            price: "asc"
        },
        include: {
            history: {
                orderBy: {
                    date: "desc"
                },
            }
        }
    });

    const user = await prisma.user.upsert({
        where: { id: author.id },
        update: {},
        create: { id: author.id }
    })

    const stocksInfosFormated = stocks.map(stock => (
        brBuilder(
            `🔹 Ação: ${stock.name} (ID: ${stock.id})`,
            `Preço atual: R$${stock.price.toNumber()}`,
            `Descrição: ${stock.description || "Sem descrição disponível"}`,
            `Histórico de preços:\n${stock.history.map(history => `- ${history.date.toLocaleDateString()}: R$${history.price.toNumber()}`).join("\n")}`
        )
    )).join("\n\n");

    const amountToBuy = options.getNumber("amount", true);
    const totalMoney = user.money.toNumber();

    const prompt = brBuilder(
        `Você é um analista de investimentos e deve avaliar o desempenho de várias ações disponíveis no mercado.`,
        `O usuário ${author.displayName} possui R$${totalMoney} em verba e deseja comprar ${amountToBuy} ações.`,
        `Aqui estão as informações das ações disponíveis:\n\n${stocksInfosFormated}`,
        `Com base nessas informações, diga quais são as melhores ações para o usuário comprar no momento.`,
        `Explique claramente o motivo de sua escolha.`,
        `Distribua o número de ações (${amountToBuy}) entre as melhores opções sugeridas, respeitando o orçamento total de R$${totalMoney}.`,
        `Apresente o resultado como uma lista com o nome da ação, a quantidade sugerida para comprar e o total gasto por ação.`
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
                type: "info",
                timestamp: new Date(),
                message: `Pediu a IA para avaliar todas as ações disponíveis`,
                level: 3,
                tags: ["economy", "investment", "ia", "sub"]
            },
        });

        interaction.editReply(res.success(`A avaliação das ações disponíveis foi avaliada pela IA, veja abaixo a avaliação:\n\n**${avaliation}**`))
    } catch (error) {
        console.error("Erro ao gerar conteúdo:", error);
        interaction.editReply(res.danger("Ocorreu um erro ao processar a solicitação. Tente novamente mais tarde."));
        return;
    }
}