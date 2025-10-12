import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { getBlackjackGame, icon, removeBlackjackGame, resv2 } from "#functions";
import { menus } from "#menus";
import { createLabel, createModalFields, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle } from "discord.js";

createResponder({
    customId: "blackjack/delete/:action",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    async run(interaction, { action}) {
        if (action === "delete") {
            if (!interaction.isButton()) return;
            const game = getBlackjackGame(interaction.user.id);
    
            if (!game) {
                interaction.update(resv2.danger(`${icon.denied} | A partida já tinha sido deletada ou encerrada posteriomente.`));
                return;
            }
    
            removeBlackjackGame(interaction.user.id);
            interaction.update(resv2.success(`${icon.success} | A partida foi deletada com sucesso. deseja jogar uma partida?`, createRow(
                new ButtonBuilder({
                    customId: "blackjack/delete/start",
                    label: "Sim",
                    style: ButtonStyle.Success
                })
            )))
            return;
        } else {
            if (interaction.isModalSubmit()) {
                const game = getBlackjackGame(interaction.user.id);
                if (game) {
                    interaction.update(resv2.danger(`${icon.denied} | Você já está jogando uma partida, você deseja deletar ela?`, createRow(
                        new ButtonBuilder({
                            customId: "blackjack/delete/delete",
                            label: "Sim",
                            style: ButtonStyle.Danger
                        })
                    )))
                    return;
                }

                const amountString = interaction.fields.getTextInputValue("amount");

                let amount = parseInt(amountString);
                if (isNaN(amount) || amount < 50) {
                    interaction.update(resv2.danger(`${icon.denied} | Você não escreveu um número ou valor acima de 50`, createRow(
                        new ButtonBuilder({
                            customId: "blackjack/delete/start",
                            label: "Tentar novamente",
                            style: ButtonStyle.Primary
                        })
                    )))
                    return;
                }

                await interaction.deferUpdate();
                const user = await prisma.user.findUnique({ where: { id: interaction.user.id } });

                if (!user) {
                    interaction.editReply(resv2.danger(`${icon.denied} | Você não tem dinheiro suficiente para apostar.`));
                    return;
                }
                if (user.money.toNumber() < amount) amount = user.money.toNumber();

                if (amount < 50) {
                    interaction.editReply(resv2.danger(`${icon.denied} | Você não tem dinheiro suficiente para apostar.`));
                    return;
                }

                interaction.editReply(menus.cassino.blackjack(interaction.user.id, amount));
                return;
            }
            const game = getBlackjackGame(interaction.user.id);
            if (game) {
                interaction.update(resv2.danger(`${icon.denied} | Você já está jogando uma partida, você deseja deletar ela?`, createRow(
                    new ButtonBuilder({
                        customId: "blackjack/delete/delete",
                        label: "Sim",
                        style: ButtonStyle.Danger
                    })
                )))
                return;
            }

            await interaction.showModal({
                customId: "blackjack/delete/start",
                title: "Aposta",
                components: createModalFields(
                    createLabel({
                        label: "Quantia à apostar",
                        component: new TextInputBuilder({
                            customId: "amount",
                            style: TextInputStyle.Short,
                            required: true,
                            placeholder: "digite um valor acima de 50",
                        })
                    })
                )
            })
            return;
        }
    },
});