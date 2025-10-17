import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { battleManage, CachedPetBattle, icon, normalizePetPower, res, resv2 } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "petBattle/acceptChoosePet/:userId/:targetId/:userPetId/:amount",
    types: [ResponderType.StringSelect], cache: "cached",
    parse(params) {
        return {
            userId: params.userId,
            targetId: params.targetId,
            userPetId: +params.userPetId,
            amount: isNaN(+params.amount) ? null : +params.amount
        }
    },
    async run(interaction, { targetId, userId, userPetId, amount }) {
        const { user, values, channel, guild, message } = interaction;

        if (user.id === userId) {
            await interaction.update(resv2.danger(
                `${icon.success} | O criador da partida decidiu cancelar ela antes da hora!`
            ))
            return;
        }

        if (user.id !== targetId) {
            await interaction.reply(res.danger(`${icon.denied} | Apenas o usuário selecionado e quem executou o comando podem usar esse botão`))
            return;
        }

        await interaction.deferReply();

        const petId = +values[0];

        /* target pet é o pet do usuário selecionado para a luta, userPet é quem criou a luta */
        const [targetPet, userPet] = await prisma.$transaction([
            prisma.userPet.findUnique({
                where: {
                    id: petId,
                    userId: targetId,
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
            }),
            prisma.userPet.findUnique({
                where: {
                    id: userPetId,
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
            }),
        ])

        if (!targetPet) {
            await interaction.editReply(resv2.danger(`${icon.error} | Eu não consegui encontrar esse targetPet!`));
            return;
        }

        if (targetPet.powers.length < 1) {
            await interaction.editReply(resv2.danger(`${icon.error} | Esse pet não tem poderes!`));
            return;
        }

        if (!userPet) {
            await interaction.editReply(resv2.danger(`${icon.error} | Eu não consegui encontrar o pet de quem criou a luta!`));
            return;
        }

        if (userPet.powers.length < 1) {
            await interaction.editReply(resv2.danger(`${icon.error} | O pet de ${user.username} não tem poderes!`));
            return;
        }

        if (!channel) {
            await interaction.editReply(resv2.danger(`${icon.error} | Esse comando deve ser usado em um canal!`))
            return;
        }

        const battle = await prisma.combatHistory.create({
            data: {
                channelId: channel.id,
                guildId: guild.id,
                amount,
                messageId: message.id,
                pet1Id: userPet.id,
                pet2Id: targetPet.id,
                user1Id: user.id,
                user2Id: targetId
            }
        });

        const baseCachedPetBattle: CachedPetBattle = {
            id: battle.id,
            pet1Id: userPet.id,
            pet2Id: targetPet.id,
            user1Id: user.id,
            user2Id: targetId,
            amount,
            round: 0,
            turn: "PET1",
            pet1: {
                life: 100,
                mana: 100,
                powers: userPet.powers.map(p => ({
                    ...p,
                    ...normalizePetPower(p.power)
                })),
                name: userPet.name
            },
            pet2: {
                life: 100,
                mana: 100,
                powers: targetPet.powers.map(p => ({
                    ...p,
                    ...normalizePetPower(p.power)
                })),
                name: targetPet.name
            },
            effects: []
        }
        
        await battleManage.setPetBattle(baseCachedPetBattle)

        await interaction.editReply(menus.pets.battle.battle(baseCachedPetBattle))
        return;
},
});