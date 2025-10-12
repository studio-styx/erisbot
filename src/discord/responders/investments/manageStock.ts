import { createResponder, ResponderType } from "#base";
import { AttachmentBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle } from "discord.js";
import { PrismaClient } from "#prisma";
import { brBuilder, createContainer, createLabel, createModalFields, createRow, createSeparator } from "@magicyan/discord";
import { createGraphic, generateGeminiContent, icon, registerLog, res } from "#functions";
import { settings } from "#settings";
const prisma = new PrismaClient();

createResponder({
    customId: "investment/manage/:stockId/:action",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    async run(interaction, { stockId, action }) {
        const id = Number(stockId);
        
        switch (action) {
            case "info": {
                if (interaction.isModalSubmit()) return;
                await interaction.deferUpdate();
                const stock = await prisma.stock.findUnique({ where: { id } });
        
                if (!stock) {
                    interaction.reply(res.danger(`${icon.error} | Stock not found`));
                    return;
                }
        
                const holding = await prisma.stockHolding.findUnique({
                    where: {
                        userId_stockId: {
                            userId: interaction.user.id,
                            stockId: id
                        }
                    }
                })
        
                if (!holding) {
                    interaction.reply(res.danger(`${icon.error} | You don't have any stocks of this type`));
                    return;
                }
        
                const safeFileName = `stock-info-${stock.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
                const attachment = new AttachmentBuilder(
                    await createGraphic(stock, await prisma.stockHistory.findMany({ where: { stockId: id } })),
                    { name: safeFileName }
                );
        
                const components: any[] = [
                    brBuilder(
                        `## Gerenciando ação: ${stock.name}`,
                        `Você possui ${holding.amount} ações de ${stock.name}`,
                        `**Preço atual:** ${stock.price} stx`,
                        `**Total**: ${holding.amount * stock.price.toNumber()} stx`,
                        `**Descrição**: ${stock.description || "Nenhuma"}`,
                        `**Avaliação da IA**: ${stock.iaAvaliation || "Nenhuma"}`
                    ),
                    createSeparator(),
                    attachment,
                    createRow(
                        new ButtonBuilder({
                            customId: `investment/manage/${stock.id}/sell`,
                            label: "Vender",
                            style: ButtonStyle.Danger,
                            emoji: icon.money
                        }),
                        new ButtonBuilder({
                            customId: `investment/manage/${stock.id}/buy`,
                            label: "Comprar",
                            style: ButtonStyle.Success,
                            emoji: icon.bank
                        }),
                        new ButtonBuilder({
                            customId: `investment/manage/${stock.id}/IAOpinionToSell`,
                            label: "Perguntar a IA sobre vender",
                            style: ButtonStyle.Primary,
                            emoji: icon.bot
                        }),
                        new ButtonBuilder({
                            customId: `investment/manage/${stock.id}/IAOpinionToBuy`,
                            label: "Perguntar a IA sobre comprar",
                            style: ButtonStyle.Primary,
                            emoji: icon.bot
                        })
                    )
                ]

                const container = createContainer({
                    accentColor: settings.colors.fuchsia,
                    components,
                });

                try {
                    await interaction.editReply({
                        flags: ["IsComponentsV2"],
                        components: [container],
                        files: [attachment]
                    })
                    return;
                } catch (error) {
                    console.error(error);
                    interaction.reply(res.danger(`${icon.error} | An error occurred while creating the graphic`));
                    return;
                }
            }
            case "sell": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `investment/manage/${stockId}/sell`,
                        title: "Vender ações",
                        components: createModalFields(
                            createLabel({
                                label: "Quantidade de ações",
                                component: new TextInputBuilder({
                                    customId: "response",
                                    style: TextInputStyle.Short,
                                    required: true,
                                })
                            })
                        ),
                    });
                    return;
                } else {
                    const amount = parseInt(interaction.fields.getTextInputValue("response"));
                    const stock = await prisma.stock.findUnique({ where: { id } });

                    if (!stock) {
                        interaction.reply(res.danger(`${icon.error} | Stock not found`));
                        return;
                    }

                    if (isNaN(amount)) {
                        interaction.reply(res.danger(`${icon.error} | Invalid amount, please insert a number`));
                        return;
                    }

                    await interaction.deferReply({ flags });

                    const holding = await prisma.stockHolding.findUnique({
                        where: {
                            userId_stockId: {
                                userId: interaction.user.id,
                                stockId: id
                            }
                        }
                    })

                    if (!holding) {
                        interaction.editReply(res.danger(`${icon.error} | You don't have any stocks of this type`));
                        return;
                    }

                    if (holding.amount < amount) {
                        interaction.editReply(res.danger(`${icon.error} | You don't have enough stocks of this type`));
                        return;
                    }

                    await prisma.stockHolding.update({
                        where: {
                            userId_stockId: {
                                userId: interaction.user.id,
                                stockId: id
                            }
                        },
                        data: {
                            amount: {
                                decrement: amount
                            }
                        }
                    })

                    await prisma.user.update({
                        where: {
                            id: interaction.user.id
                        },
                        data: {
                            money: {
                                increment: amount * stock.price.toNumber()
                            }
                        }
                    })

                    interaction.editReply(res.success(`${icon.success} | You sold ${amount} stocks of ${stock.name} for ${amount * stock.price.toNumber()} stx`));
                    return;
                }
            }
            case "buy": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `investment/manage/${stockId}/buy`,
                        title: "Comprar ações",
                        components: createModalFields(
                            createLabel({
                                label: "Quantidade de ações",
                                component: new TextInputBuilder({
                                    customId: "response",
                                    style: TextInputStyle.Short,
                                    required: true,
                                })
                            })
                        )
                    })
                } else {
                    const amount = parseInt(interaction.fields.getTextInputValue("response"));
                    const stock = await prisma.stock.findUnique({ where: { id } });

                    if (!stock) {
                        interaction.reply(res.danger(`${icon.error} | Stock not found`));
                        return;
                    }

                    if (isNaN(amount)) {
                        interaction.reply(res.danger(`${icon.error} | Invalid amount, please insert a number`));
                        return;
                    }

                    await interaction.deferReply({ flags });

                    const holding = await prisma.stockHolding.findUnique({
                        where: {
                            userId_stockId: {
                                userId: interaction.user.id,
                                stockId: id
                            }
                        }
                    })

                    if (!holding) {
                        interaction.editReply(res.danger(`${icon.error} | You don't have any stocks of this type`));
                        return;
                    }

                    const user = await prisma.user.findUnique({
                        where: {
                            id: interaction.user.id
                        }
                    })

                    if (!user) {
                        interaction.editReply(res.danger(`${icon.error} | User not found`));
                        return;
                    }

                    if (user.money.toNumber() < amount * stock.price.toNumber()) {
                        interaction.editReply(res.danger(`${icon.error} | You don't have enough money`));
                        return;
                    }

                    await prisma.stockHolding.update({
                        where: {
                            userId_stockId: {
                                userId: interaction.user.id,
                                stockId: id
                            }
                        },
                        data: {
                            amount: {
                                increment: amount
                            }
                        }
                    })

                    await prisma.user.update({
                        where: {
                            id: interaction.user.id
                        },
                        data: {
                            money: {
                                decrement: amount * stock.price.toNumber()
                            }
                        }
                    })

                    interaction.editReply(res.success(`${icon.success} | You bought ${amount} stocks of ${stock.name} for ${amount * stock.price.toNumber()} stx`));
                    return;
                }
            }
            case "IAOpinionToSell": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `investment/manage/${stockId}/IAOpinionToSell`,
                        title: "Perguntar a IA sobre vender",
                        components: createModalFields(
                            createLabel({
                                label: "Quantidade de ações",
                                component: new TextInputBuilder({
                                    customId: "amount",
                                    style: TextInputStyle.Short,
                                    required: true,
                                })
                            }),
                            createLabel({
                                label: "Pergunta",
                                component: new TextInputBuilder({
                                    customId: "answer",
                                    style: TextInputStyle.Paragraph,
                                    required: false,
                                })
                            })
                        )
                    })
                    return;
                }
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

                const stock = await prisma.stock.findUnique({ where: { id } });
                const amount = parseInt(interaction.fields.getTextInputValue("amount"));
                const answer = interaction.fields.getTextInputValue("answer");

                if (isNaN(amount)) {
                    interaction.editReply(res.danger(`${icon.error} | Invalid amount, please insert a number`));
                    return;
                }

                if (!stock) {
                    interaction.editReply(res.danger(`${icon.error} | Stock not found`));
                    return;
                }

                const holding = await prisma.stockHolding.findUnique({
                    where: {
                        userId_stockId: {
                            userId: interaction.user.id,
                            stockId: id
                        }
                    }
                })

                if (!holding) {
                    interaction.editReply(res.danger(`${icon.error} | You don't have any stocks of this type`));
                    return;
                }

                const history = await prisma.stockHistory.findMany({
                    where: {
                        stockId: id
                    },
                    orderBy: {
                        date: "desc"
                    }
                })

                const historyFormatted = history.slice(0, 30)
                    .map(h => `- ${h.date}: R$${h.price}`)
                    .join("\n");

                const prompt = brBuilder(
                    `Você é um analista financeiro experiente, especializado em investimentos em ações.`,
                    `Seu trabalho agora é avaliar a situação da ação **${stock.name}** para o usuário ${interaction.user.displayName}, que deseja vender parte de sua posição.`,
                    `Abaixo estão as informações disponíveis sobre a ação:`,

                    `• Nome: ${stock.name}`,
                    `• Preço atual: R$${stock.price} stx`,
                    `• Descrição: ${stock.description || "Não há descrição disponível"}`,
                    `• Avaliação anterior por IA: ${stock.iaAvaliation || "Não há avaliação anterior"}`,
                    `• Histórico recente de preços (máx. 30 registros):\n${historyFormatted}`,
                    `• Quantidade total de ações que o usuário possui: ${holding.amount}`,
                    `• Quantidade de ações que o usuário deseja vender: ${amount}`,

                    answer ? `• Pergunta adicional do usuário: ${answer}` : null,

                    `Com base nessas informações, diga se vender agora é uma boa decisão.`,
                    `Explique claramente sua análise, considerando o preço atual, o histórico e possíveis tendências.`,
                    `Sua resposta deve ser compreensível até para quem não entende de finanças ou mercado de ações.`
                );

                await interaction.editReply(res.success(`${icon.success} | Your question has been sent to the AI, please wait for the answer`));

                try {
                    const result = await generateGeminiContent(prompt);

                    if (!result.success || !result.text) {
                        console.error("Error generating the response:" + result);
                        interaction.editReply(res.danger(`${icon.error} | An error occurred while sending the question to the AI`));
                        return;
                    }

                    interaction.editReply(res.warning(`${icon.waiting_white} | Your question has been sent to the AI, here is the answer:\n${result.text}`));
                    await registerLog({
                        message: `Pediu a opinião da IA sobre vender a ação ${stock.name}`,
                        level: 3,
                        type: "debug",
                        user: interaction.user.id,
                        tags: ["ia", "stock"]
                    })
                    return;
                } catch (error) {
                    console.error(error);
                    interaction.editReply(res.danger(`${icon.error} | An error occurred while sending the question to the AI`));
                    return;
                }
            }
            case "IAOpinionToBuy": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `investment/manage/${stockId}/IAOpinionToBuy`,
                        title: "Perguntar à IA sobre comprar",
                        components: createModalFields(
                            createLabel({
                                label: "Quantidade de ações",
                                component: new TextInputBuilder({
                                    customId: "amount",
                                    style: TextInputStyle.Short,
                                    required: true,
                                })
                            }),
                            createLabel({
                                label: "Pergunta",
                                component: new TextInputBuilder({
                                    customId: "answer",
                                    style: TextInputStyle.Paragraph,
                                    required: false,
                                })
                            })
                        )
                    });
                    return;
                }
            
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

                const stock = await prisma.stock.findUnique({ where: { id } });
                const amount = parseInt(interaction.fields.getTextInputValue("amount"));
                const answer = interaction.fields.getTextInputValue("answer");
            
                if (isNaN(amount)) {
                    interaction.editReply(res.danger(`${icon.error} | Quantidade inválida, insira um número válido`));
                    return;
                }
            
                if (!stock) {
                    interaction.editReply(res.danger(`${icon.error} | Ação não encontrada`));
                    return;
                }
            
                const history = await prisma.stockHistory.findMany({
                    where: {
                        stockId: id
                    },
                    orderBy: {
                        date: "desc"
                    }
                });
            
                const historyFormatted = history.slice(0, 30)
                    .map(h => `- ${h.date}: R$${h.price}`)
                    .join("\n");
            
                const prompt = brBuilder(
                    `Você é um analista financeiro experiente, especializado em investimentos em ações.`,
                    `Seu trabalho agora é avaliar a ação **${stock.name}** para o usuário ${interaction.user.displayName}, que está interessado em comprá-la.`,
            
                    `Abaixo estão as informações disponíveis sobre a ação:`,
            
                    `• Nome: ${stock.name}`,
                    `• Preço atual: R$${stock.price} stx`,
                    `• Descrição: ${stock.description || "Não há descrição disponível"}`,
                    `• Avaliação anterior por IA: ${stock.iaAvaliation || "Não há avaliação anterior"}`,
                    `• Histórico recente de preços (máx. 30 registros):\n${historyFormatted}`,
                    `• Quantidade de ações que o usuário deseja comprar: ${amount}`,
            
                    answer ? `• Pergunta adicional do usuário: ${answer}` : null,
            
                    `Com base nessas informações, diga se **comprar agora** é uma boa decisão.`,
                    `Explique sua análise com clareza, considerando o preço atual, o histórico e possíveis tendências do mercado.`,
                    `Sua resposta deve ser compreensível mesmo para quem não entende de finanças ou mercado de ações.`
                );
            
                await interaction.editReply(res.warning(`${icon.waiting_white} | Sua pergunta foi enviada à IA, aguarde pela resposta`));
            
                try {
                    const result = await generateGeminiContent(prompt);
            
                    if (!result.success || !result.text) {
                        console.error("Erro ao gerar a resposta da IA:", result);
                        interaction.editReply(res.danger(`${icon.error} | Ocorreu um erro ao enviar a pergunta para a IA`));
                        return;
                    }
            
                    interaction.editReply(res.success(`${icon.success} | Aqui está a resposta da IA:\n${result.text}`));
                    await registerLog({
                        message: `Pediu a opinião da IA sobre comprar a ação ${stock.name}`,
                        level: 3,
                        type: "debug",
                        user: interaction.user.id,
                        tags: ["ia", "stock"]
                    });
                    return;
                } catch (error) {
                    console.error(error);
                    interaction.editReply(res.danger(`${icon.error} | Ocorreu um erro ao enviar a pergunta para a IA`));
                    return;
                }
            }            
        }
    },
});