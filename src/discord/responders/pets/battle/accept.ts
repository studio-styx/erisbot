import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, petAnimalFormatted, res, resv2 } from "#functions";
import { StringSelectMenuBuilder, userMention } from "discord.js";

createResponder({
    customId: "petBattle/accept/:userId/:targetId/:userPetId/:amount",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            userId: params.userId,
            targetId: params.targetId,
            userPetId: +params.userPetId,
            amount: isNaN(+params.amount) ? null : +params.amount
        }
    },
    async run(interaction, { targetId, userId, userPetId, amount }) {
        const { user } = interaction;
        if (user.id === userId) {
            await interaction.update(resv2.danger(
                `${icon.success} | Você cancelou o pedido de batalha`
            ))
            return;
        }
        if (user.id !== targetId) {
            await interaction.reply(res.danger(`${icon.denied} | Apenas o usuário selecionado e quem executou o comando podem usar esse botão`))
            return;
        }

        await interaction.deferReply();

        const selectedUserPets = await prisma.userPet.findMany({
            where: {
                userId,
                isDead: false,
                adoption: null,
                isPregnant: false,
            },
            include: {
                powers: {
                    include: {
                        power: true
                    }
                },
                pet: true
            }
        })

        if (!selectedUserPets || selectedUserPets.length < 1 || selectedUserPets.some(p => p.powers.length > 0)) {
            await interaction.editReply(`${icon.error} | Você não tem pets disponiveis! você deve ter ao menos 1 pet com algum poder`);
            return;
        }

        await interaction.editReply(resv2.warning(
            `Você aceitou a batalha! escolha um dos pets abaixo para batalhar contra o usuário ${userMention(userId)}`,
            new StringSelectMenuBuilder({
                customId: `petBattle/acceptChoosePet/${userId}/${targetId}/${userPetId}/${amount}`,
                placeholder: "Escolha um pet para batalhar",
                options: selectedUserPets.filter(pet => pet.powers.length > 0).slice(0, 25).map(pet => ({
                    label: `${pet.name} - (${petAnimalFormatted[pet.pet.animal]})`,
                    value: pet.id.toString()
                }))
            })
        ))
        return;
    },
});