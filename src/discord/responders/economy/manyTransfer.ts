import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { getCommandId, icon, res } from "#functions";
import { settings } from "#settings";
import { brBuilder, createContainer, createEmbed, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, GuildMember, userMention } from "discord.js";

createResponder({
    customId: "manyTransfer/:userId/:amount",
    types: [ResponderType.UserSelect], cache: "cached",
    parse(params) {
        return {
            amount: Number.parseInt(params.amount),
            userId: params.userId
        }
    },
    async run(interaction, { amount, userId }) {
        if (!interaction.channel) {
            interaction.reply(`Esse comando deve ser usado em um canal válido`)
            return;
        }
        if (!interaction.guild) {
            interaction.reply(res.danger(`${icon.denied} | Esse comando deve ser usado em um server!`))
            return;
        }
        if (interaction.user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Você não é o dono desse comando!`));
            return;
        }
        const ids = interaction.values.filter(id => id !== userId);

        if (ids.length < 1) {
            interaction.reply(`${icon.denied} | Usuários insuficientes para a transação!`)
            return;
        };

        const users: GuildMember[] = [];
        const errors: { userId: string; reason: string }[] = [];

        await interaction.deferUpdate();
        for (const id of ids) {
            let member = interaction.guild.members.cache.get(id);
            if (!member) {
                member = await interaction.guild.members.fetch(id);
            }
            if (!member) {
                errors.push({
                    userId: id,
                    reason: "Usuário não encontrado nesse server."
                });
                continue;
            };
            if (member.user.bot) {
                errors.push({
                    userId: id,
                    reason: `Usuário é um bot.`
                });
                continue;
            };
            const hasPermissionsToViewChannel = member.permissionsIn(interaction.channel!).has("ViewChannel");
            const hasPermissionsToReadMessageHistory = member.permissionsIn(interaction.channel!).has("ReadMessageHistory");
            if (!hasPermissionsToReadMessageHistory || !hasPermissionsToViewChannel) {
                if (!hasPermissionsToReadMessageHistory) errors.push({
                    userId: id,
                    reason: `Usuário não tem permissão pra ver o histórico de mensagens do canal onde foi usado o comando.`
                })
                if (!hasPermissionsToViewChannel) errors.push({
                    userId: id,
                    reason: "Usuário não tem permissão pra ver o canal onde foi usado o comando."
                })
                continue;
            }

            users.push(member)
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            interaction.editReply(res.danger(`${icon.denied} | Primeira vez aqui e já quer transferir dinheiro para os outros? por quê você não explora meus comandos primeiro, antes de iniciar uma transação com alguém?`))
            return;
        }
        const money = user.money.toNumber();
        const bank = user.bank.toNumber();
        const totalToPay = amount * users.length;

        if (totalToPay > money) {
            const bankCommandId = await getCommandId(interaction, "bank");
            interaction.editReply(res.danger(`${icon.denied} Você não tem dinheiro suficiente para pagar os: **${users.length}** usuários! você precisa de **${totalToPay}** stx você precisa de mais: **${totalToPay - money}** para completar a transação ${bank + money > totalToPay ? `Por sorte você tem o restante no banco! você pode usar o comando **</bank withdraw:${bankCommandId}>** para retirar dinheiro do seu banco, e depois usar esse comando novamente` : ""}`))
            return;
        }

        const container = createContainer({
            accentColor: users.length > 0 ? settings.colors.fuchsia : settings.colors.danger,
            components: [
                brBuilder(
                    "## Transação"
                ),
                createSeparator(),
                users.length > 0 ? brBuilder(
                    `Uma transação foi iniciada com: **${users.length === 1 ? "1 usuário" : `${users.length} usuários`}**, eles tem que aceitar as transações abaixo para receber o dinheiro.`,
                    "-# A transação não depende de todos os usuários para ser concluida, assim que o usuário aceitar sua transação ele receberá seu dinheiro."
                ) : brBuilder(
                    `Nenhum usuário foi encontrado para iniciar a transação! ${icon.Eris_cry}`
                ),
                errors.length > 0 && createSeparator(),
                errors.length > 0 && brBuilder(
                    `Um total de ${errors.length === 1 ? "1 erro foi encontrado" : `${errors.length} erros foram encontrados`}`,
                    errors.map((e, index) => `> - ${index + 1}. ${userMention(e.userId)} | ${e.reason}`)
                ),
                users.length > 0 && createSeparator(),
                users.length > 0 && brBuilder(
                    `Usuários que precisam aceitar a transação: **(${users.length})**`,
                    users.map(u => `> - ${u.displayName}`)
                )
            ]
        })

        await interaction.editReply({
            flags: "IsComponentsV2",
            components: [container],
            allowedMentions: { parse: [] }
        });

        for (const target of users) {
            const [_, transaction] = await prisma.$transaction([
                prisma.user.upsert({
                    where: { id: target.id },
                    create: { id: target.id },
                    update: {}
                }),
                prisma.transaction.create({
                    data: {
                        userId: interaction.user.id,
                        targetId: target.id,
                        amount,
                        guildId: interaction.guildId,
                        channelId: interaction.channelId,
                        type: "USER",
                        status: "PENDING"
                    },
                    select: { id: true }
                })
            ])
            const embed = createEmbed({
                title: `Transferência`,
                description: brBuilder(
                    `${icon.alarm} | ${userMention(interaction.user.id)} quer enviar **${amount}** styx para ${userMention(target.id)}, ambos precisam apertar no botão abaixo para que a transferência seja concluida`,
                ),
                color: settings.colors.success
            });
            const row = createRow(
                new ButtonBuilder({
                    customId: `transfer/${interaction.user.id}/1/${target.id}/0/${transaction.id}`,
                    emoji: icon.paid,
                    label: "Confirmar ( 1/2 )",
                    style: ButtonStyle.Success
                })
            )

            const msg = await interaction.followUp({
                embeds: [embed],
                components: [row]
            });

            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { messageId: msg.id }
            })
        }
    },
});