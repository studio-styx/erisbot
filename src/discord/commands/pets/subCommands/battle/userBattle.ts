import { prisma } from "#database";
import { getValidUserPet, icon, resv2 } from "#functions";
import { createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, userMention } from "discord.js";

export async function userBattleCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options, user, client } = interaction;

    const petId = Number(options.getString("battlepet", true));
    const selectedUser = options.getUser("user", true);
    const amount = options.getNumber("amount");

    // verificações iniciais
    if (selectedUser.id === user.id) {
        await interaction.editReply(`${icon.denied} | Você não pode lutar contra você mesmo!`);
        return;
    }

    if (selectedUser.id === client.application.id) {
        await interaction.editReply(`${icon.denied} | Você não pode lutar contra mim! eu acabaria com você facil.`);
        return;
    }

    if (selectedUser.bot) {
        await interaction.editReply(`${icon.denied} | Você não pode lutar contra um bot!`)
        return;
    }

    await interaction.deferReply();

    const pet = await getValidUserPet(petId, user.id, {
        include: {
            powers: {
                include: {
                    power: true
                }
            }
        }
    });

    // Verificações de pet
    if (!pet) {
        await interaction.editReply(`${icon.error} | Eu não consegui encontrar esse pet!`);
        return;
    }

    if (pet.powers.length < 1) {
        await interaction.editReply(`${icon.error} | Esse pet não tem poderes!`);
        return;
    }

    if (pet.isPregnant) {
        await interaction.editReply(`${icon.denied} | Você está louco de enviar uma pet grávida para lutar!?`);
        return;
    }

    // procurar pelos pets do usuário selecionado
    const selectedUserPets = await prisma.userPet.findMany({
        where: {
            userId: selectedUser.id,
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
        await interaction.editReply(`${icon.error} | O usuário selecionado não tem pets disponiveis!`);
        return;
    }

    await interaction.editReply(resv2.warning(
        `## Batalha`,
        createSeparator(),
        `O usuário ${userMention(selectedUser.id)} precisa aceitar a proposta para iniciar a batalha clicando no botão abaixo`,
        new ButtonBuilder({
            customId: `petBattle/accept/${user.id}/${selectedUser.id}/${pet.id}/${amount}`,
            label: "Aceitar",
            style: ButtonStyle.Success
        })
    ))
}