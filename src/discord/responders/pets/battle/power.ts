import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { BattleEffects, battleManage, CachedPetBattle, getRandomNumber, icon, PetAutoDamageDetails, PetAutoHealDetails, PetBuffPowerDetails, PetDamagePowerDetails, PetDebuffPowerDetails, PetHealDetails, res, resv2 } from "#functions";
import { menus } from "#menus";
import { ButtonComponent, ContainerComponent, ComponentType, userMention } from "discord.js";

createResponder({
    customId: "battle/:battleId/:powerId/:userId",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            battleId: +params.battleId,
            powerId: params.powerId === "skip" ? "skip" : params.powerId === "end" ? "end" : +params.powerId as "skip" | "end" | number,
            userId: params.userId
        }
    },
    async run(interaction, { battleId, powerId, userId }) {
        try {
            const { user } = interaction;
            if (user.id !== userId) {
                await interaction.reply(res.danger(`${icon.denied} | Apenas ${userMention(userId)} pode usar esse botão!`));
                return;
            }

            const battle = await battleManage.getPetBattle(battleId);
            if (!battle) {
                await interaction.reply(res.danger(`${icon.error} | Eu não consegui encontrar essa batalha! provavelmente ela demorou demais para acabar!`));
                return;
            }

            await interaction.deferUpdate();

            // Verificar a existência dos pets
            const [pet1db, pet2db] = await prisma.$transaction([
                prisma.userPet.findUnique({
                    where: { id: battle.pet1Id, isDead: false, adoption: null, isPregnant: false },
                }),
                prisma.userPet.findUnique({
                    where: { id: battle.pet2Id, isDead: false, adoption: null, isPregnant: false },
                }),
            ]);

            if (!pet1db || !pet2db) {
                await interaction.editReply(resv2.danger(`${icon.error} | Eu não consegui encontrar um dos pets da batalha!`));
                return;
            }

            if (powerId === "skip") {
                battle.round += 1;
                battle.turn = battle.turn === "PET1" ? "PET2" : "PET1";
                // Reduzir o cooldown de todos os poderes
                const localBattle = JSON.parse(JSON.stringify(battle)) as CachedPetBattle
                localBattle.pet1.powers.forEach(p => {
                    p.cooldown = Math.max(0, p.cooldown - 1);
                });
                localBattle.pet2.powers.forEach(p => {
                    p.cooldown = Math.max(0, p.cooldown - 1);
                });

                // Obter os pets atacante e defensor
                const attacker = localBattle.turn === "PET1" ? localBattle.pet1 : localBattle.pet2;
                const defender = localBattle.turn === "PET1" ? localBattle.pet2 : localBattle.pet1;

                // Aumentar um pouco a mana do defensor
                defender.mana = Math.min(100, defender.mana + getRandomNumber(5, 10));
                attacker.mana = Math.min(100, defender.mana + getRandomNumber(5, 14));

                // Aplicar efeitos de longa duração antes de usar o poder
                const activeEffects = localBattle.effects.filter(effect => effect.startedRoud + effect.durationRounds >= localBattle.round);

                // Processar efeitos de longa duração
                for (const effect of activeEffects) {

                    // Efeitos de dano ou cura no defensor
                    if (effect.type === "DAMAGE" && effect.effected !== localBattle.turn) {
                        const damage = Number(effect.stats.damage) || 0;
                        defender.life = Math.max(0, defender.life - damage);
                    } else if (effect.type === "HEAL" && effect.effected === localBattle.turn) {
                        const heal = Number(effect.stats.heal) || 0;
                        attacker.life = Math.min(attacker.life + heal, 100);
                    }
                }

                await interaction.editReply(menus.pets.battle.battle(localBattle));
                await battleManage.setPetBattle(localBattle);
                return;
            } else if (powerId === "end") {
                await prisma.combatHistory.delete({
                    where: { id: battleId }
                });
                await battleManage.deletePetBattle(battleId);

                await interaction.editReply(resv2.success(`${icon.success} | A batalha foi finalizada por ${userMention(userId)}!`))
                return;
            }

            // Verificar o poder selecionado
            const powerDetails = battle.turn === "PET1"
                ? battle.pet1.powers.find(p => p.id === powerId)
                : battle.pet2.powers.find(p => p.id === powerId);

            if (!powerDetails) {
                const container = interaction.message.components[0] as ContainerComponent;
                const rawComponents = container.components.slice(6, 99) as unknown[];
                const allPowersButtons = rawComponents.filter((c): c is ButtonComponent => (c as any).type === ComponentType.Button);
                const button = allPowersButtons.find(b => b.customId === `battle/${battle.id}/${powerId}/${userId}`);

                await interaction.followUp(res.danger(`${icon.error} | ${button ? `Eu não consegui encontrar o poder **${button.label}**!` : "Eu não consegui encontrar esse poder!"}`));
                await interaction.update(menus.pets.battle.battle(battle));
                return;
            }

            // Clonar o objeto da batalha para evitar mutações indesejadas
            const localBattle = JSON.parse(JSON.stringify(battle)) as CachedPetBattle;

            // Validar vida inicial dos pets
            if (isNaN(localBattle.pet1.life) || isNaN(localBattle.pet2.life)) {
                console.error(`Vida inválida detectada: pet1.life=${localBattle.pet1.life}, pet2.life=${localBattle.pet2.life}`);
                await interaction.followUp(res.danger(`${icon.error} | Erro: Vida de um dos pets é inválida!`));
                return;
            }

            // Reduzir o cooldown de todos os poderes
            localBattle.pet1.powers.forEach(p => {
                p.cooldown = Math.max(0, p.cooldown - 1);
            });
            localBattle.pet2.powers.forEach(p => {
                p.cooldown = Math.max(0, p.cooldown - 1);
            });

            // Obter os pets atacante e defensor
            const attacker = localBattle.turn === "PET1" ? localBattle.pet1 : localBattle.pet2;
            const defender = localBattle.turn === "PET1" ? localBattle.pet2 : localBattle.pet1;

            // Aumentar um pouco a mana do defensor
            defender.mana = Math.min(100, defender.mana + getRandomNumber(2, 6));

            // Aplicar efeitos de longa duração antes de usar o poder
            const activeEffects = localBattle.effects.filter(effect => effect.startedRoud + effect.durationRounds >= localBattle.round);

            // Processar efeitos de longa duração
            for (const effect of activeEffects) {
                if (effect.effected === localBattle.turn) {
                    // Efeitos no atacante
                    if (effect.type === "BUFF" && (effect.stats.elementBuffed === powerDetails.element || effect.stats.effectAll)) {
                        if (powerDetails.type === "DAMAGE" || powerDetails.type === "AUTODAMAGE") {
                            (powerDetails.details as PetDamagePowerDetails['details']).damage += effect.stats.amount;
                        } else if (powerDetails.type === "HEAL" || powerDetails.type === "AUTOHEAL") {
                            (powerDetails.details as PetHealDetails['details']).heal += effect.stats.amount;
                        }
                    } else if (effect.type === "DEBUFF" && (effect.stats.elementDebuffed === powerDetails.element || effect.stats.effectAll)) {
                        if (powerDetails.type === "DAMAGE" || powerDetails.type === "AUTODAMAGE") {
                            (powerDetails.details as PetDamagePowerDetails['details']).damage = Math.max(0, (powerDetails.details as PetDamagePowerDetails['details']).damage - effect.stats.amount);
                        } else if (powerDetails.type === "HEAL" || powerDetails.type === "AUTOHEAL") {
                            (powerDetails.details as PetHealDetails['details']).heal = Math.max(0, (powerDetails.details as PetHealDetails['details']).heal - effect.stats.amount);
                        }
                    }
                }

                // Efeitos de dano ou cura no defensor
                if (effect.type === "DAMAGE" && effect.effected !== localBattle.turn) {
                    const damage = Number(effect.stats.damage) || 0;
                    defender.life = Math.max(0, defender.life - damage);
                } else if (effect.type === "HEAL" && effect.effected === localBattle.turn) {
                    const heal = Number(effect.stats.heal) || 0;
                    attacker.life = Math.min(attacker.life + heal, 100);
                }
            }

            // Processar o poder selecionado
            const newEffects: BattleEffects[] = [];
            let damageDealt = 0;
            let healApplied = 0;

            switch (powerDetails.type) {
                case "DAMAGE": {
                    damageDealt = (powerDetails.details as PetDamagePowerDetails['details']).damage;

                    // Calcular modificadores de buff e debuff
                    const buffs = activeEffects
                        .filter(e => e.type === "BUFF" && e.effected === localBattle.turn && (e.stats.elementBuffed === powerDetails.element || e.stats.effectAll))
                        .reduce((total, e) => total + (Number((e.stats as { amount: number }).amount) || 0), 0);
                    const debuffs = activeEffects
                        .filter(e => e.type === "DEBUFF" && e.effected === localBattle.turn && (e.stats.elementDebuffed === powerDetails.element || e.stats.effectAll))
                        .reduce((total, e) => total + (Number((e.stats as { amount: number }).amount) || 0), 0);

                    // Aplicar buffs e debuffs ao dano
                    damageDealt = Math.max(0, damageDealt + buffs - debuffs);

                    defender.life = Math.max(0, defender.life - damageDealt);
                    attacker.mana -= (powerDetails.details as PetDamagePowerDetails['details']).manaCost;
                    // Atualiza o cooldown no poder do atacante
                    const attackerPowers = localBattle.turn === "PET1" ? localBattle.pet1.powers : localBattle.pet2.powers;
                    const usedPower = attackerPowers.find(p => p.id === powerId);
                    if (usedPower) {
                        usedPower.cooldown = (powerDetails.details as PetDamagePowerDetails['details']).cooldown;
                    }
                    await prisma.combatPowerHistory.create({
                        data: {
                            combatId: battle.id,
                            petId: battle.turn === "PET1" ? battle.pet1Id : battle.pet2Id,
                            damage: damageDealt,
                            userPetPowerId: powerDetails.id,
                        }
                    });
                    break;
                }
                case "HEAL": {
                    healApplied = (powerDetails.details as PetHealDetails['details']).heal;

                    // Calcular modificadores de buff e debuff
                    const buffs = activeEffects
                        .filter(e => e.type === "BUFF" && e.effected === localBattle.turn && (e.stats.elementBuffed === powerDetails.element || e.stats.effectAll))
                        .reduce((total, e) => total + (Number((e.stats as { heal: number }).heal) || 0), 0);
                    const debuffs = activeEffects
                        .filter(e => e.type === "DEBUFF" && e.effected === localBattle.turn && (e.stats.elementDebuffed === powerDetails.element || e.stats.effectAll))
                        .reduce((total, e) => total + (Number((e.stats as { heal: number }).heal) || 0), 0);

                    // Aplicar buffs e debuffs à cura
                    healApplied = Math.max(0, healApplied + buffs - debuffs);

                    attacker.life = Math.min(attacker.life + healApplied, 100);
                    attacker.mana -= (powerDetails.details as PetHealDetails['details']).manaCost;
                    // Atualiza o cooldown no poder do atacante
                    const attackerPowers = localBattle.turn === "PET1" ? localBattle.pet1.powers : localBattle.pet2.powers;
                    const usedPower = attackerPowers.find(p => p.id === powerId);
                    if (usedPower) {
                        usedPower.cooldown = (powerDetails.details as PetHealDetails['details']).cooldown;
                    }
                    await prisma.combatPowerHistory.create({
                        data: {
                            combatId: battle.id,
                            petId: battle.turn === "PET1" ? battle.pet1Id : battle.pet2Id,
                            heal: healApplied,
                            userPetPowerId: powerDetails.id,
                        }
                    });
                    break;
                }
                case "BUFF": {
                    newEffects.push({
                        type: "BUFF",
                        startedRoud: localBattle.round,
                        durationRounds: (powerDetails.details as PetBuffPowerDetails['details']).duration,
                        effected: localBattle.turn,
                        stats: {
                            amount: (powerDetails.details as PetBuffPowerDetails['details']).manaCost, // Ajustar conforme necessário
                            elementBuffed: (powerDetails.details as PetBuffPowerDetails['details']).elementBuffed || powerDetails.element,
                            effectAll: false,
                        },
                    });
                    const attackerPowers = localBattle.turn === "PET1" ? localBattle.pet1.powers : localBattle.pet2.powers;
                    const usedPower = attackerPowers.find(p => p.id === powerId);
                    if (usedPower) {
                        usedPower.cooldown = (powerDetails.details as PetBuffPowerDetails['details']).cooldown;
                    }
                    attacker.mana -= (powerDetails.details as PetBuffPowerDetails['details']).manaCost;
                    break;
                }
                case "DEBUFF": {
                    newEffects.push({
                        type: "DEBUFF",
                        startedRoud: localBattle.round,
                        durationRounds: (powerDetails.details as PetDebuffPowerDetails['details']).duration,
                        effected: localBattle.turn === "PET1" ? "PET2" : "PET1",
                        stats: {
                            amount: (powerDetails.details as PetDebuffPowerDetails['details']).manaCost, // Ajustar conforme necessário
                            elementDebuffed: (powerDetails.details as PetDebuffPowerDetails['details']).elementDebuffed || powerDetails.element,
                            effectAll: false,
                        },
                    });
                    const attackerPowers = localBattle.turn === "PET1" ? localBattle.pet1.powers : localBattle.pet2.powers;
                    const usedPower = attackerPowers.find(p => p.id === powerId);
                    if (usedPower) {
                        usedPower.cooldown = (powerDetails.details as PetDebuffPowerDetails['details']).cooldown;
                    }
                    attacker.mana -= (powerDetails.details as PetDebuffPowerDetails['details']).manaCost;
                    break;
                }
                case "AUTODAMAGE": {
                    damageDealt = (powerDetails.details as PetAutoDamageDetails['details']).damage;
                    newEffects.push({
                        type: "DAMAGE",
                        startedRoud: localBattle.round,
                        durationRounds: (powerDetails.details as PetAutoDamageDetails['details']).turnsDuration,
                        effected: localBattle.turn === "PET1" ? "PET2" : "PET1",
                        stats: {
                            damage: damageDealt,
                        },
                    });
                    const attackerPowers = localBattle.turn === "PET1" ? localBattle.pet1.powers : localBattle.pet2.powers;
                    const usedPower = attackerPowers.find(p => p.id === powerId);
                    if (usedPower) {
                        usedPower.cooldown = (powerDetails.details as PetAutoDamageDetails['details']).cooldown;
                    }
                    attacker.mana -= (powerDetails.details as PetAutoDamageDetails['details']).manaCost;
                    break;
                }
                case "AUTOHEAL": {
                    healApplied = (powerDetails.details as PetAutoHealDetails['details']).heal;
                    newEffects.push({
                        type: "HEAL",
                        startedRoud: localBattle.round,
                        durationRounds: (powerDetails.details as PetAutoHealDetails['details']).turnsDuration,
                        effected: localBattle.turn,
                        stats: {
                            heal: healApplied,
                        },
                    });
                    const attackerPowers = localBattle.turn === "PET1" ? localBattle.pet1.powers : localBattle.pet2.powers;
                    const usedPower = attackerPowers.find(p => p.id === powerId);
                    if (usedPower) {
                        usedPower.cooldown = (powerDetails.details as PetAutoHealDetails['details']).cooldown;
                    }
                    attacker.mana -= (powerDetails.details as PetAutoHealDetails['details']).manaCost;
                    break;
                }
            }

            // Validar vida após cálculos
            if (isNaN(localBattle.pet1.life) || isNaN(localBattle.pet2.life)) {
                console.error(`Vida inválida após cálculos: pet1.life=${localBattle.pet1.life}, pet2.life=${localBattle.pet2.life}`);
                await interaction.followUp(res.danger(`${icon.error} | Erro: Vida de um dos pets tornou-se inválida após o turno!`));
                return;
            }

            // Atualizar efeitos ativos, removendo os expirados
            localBattle.effects = [
                ...activeEffects.filter(effect => effect.startedRoud + effect.durationRounds > localBattle.round),
                ...newEffects,
            ];

            // Verificar se a batalha terminou
            let battleEnded = false;
            let winner: "PET1" | "PET2" | null = null;

            if (localBattle.pet1.life <= 0) {
                battleEnded = true;
                winner = "PET2";
            } else if (localBattle.pet2.life <= 0) {
                battleEnded = true;
                winner = "PET1";
            }

            localBattle.pet1.mana = Math.max(0, localBattle.pet1.mana);
            localBattle.pet2.mana = Math.max(0, localBattle.pet2.mana);

            // Atualizar o turno
            if (!battleEnded) {
                localBattle.turn = localBattle.turn === "PET1" ? "PET2" : "PET1";
                localBattle.round += 1;
            }

            // Salvar a batalha atualizada
            await battleManage.setPetBattle(localBattle);

            // Atualizar a interface
            if (battleEnded) {
                await prisma.combatHistory.update({
                    where: { id: battleId },
                    data: {
                        winnerPetId: winner === "PET1" ? localBattle.pet1Id : localBattle.pet2Id,
                        loserPetId: winner === "PET1" ? localBattle.pet2Id : localBattle.pet1Id,
                    }
                });
                await interaction.editReply(resv2.success(`${icon.success} | A batalha terminou! ${winner === "PET1" ? localBattle.pet1.name : localBattle.pet2.name} pet de: ${userMention(winner === "PET1" ? localBattle.user1Id : localBattle.user2Id)} venceu!`));
                await battleManage.deletePetBattle(battleId);
            } else {
                await interaction.editReply(menus.pets.battle.battle(localBattle));
            }

            // Enviar mensagem com o resultado do turno
            let actionMessage = `**${attacker.name}** usou **${powerDetails.name}**!`;
            if (powerDetails.type === "DAMAGE" || powerDetails.type === "AUTODAMAGE") {
                actionMessage = `**${attacker.name}** usou **${powerDetails.name}** e causou **${damageDealt}** de dano!`;
            } else if (powerDetails.type === "HEAL" || powerDetails.type === "AUTOHEAL") {
                actionMessage = `**${attacker.name}** usou **${powerDetails.name}** e curou **${healApplied}** de vida!`;
            }

            const msg = await interaction.followUp(res.primary(actionMessage, { flags: [] }));

            setTimeout(async () => {
                try {
                    await msg.delete();
                } catch (e) { }
            }, 1000 * 10);
        } catch (e: any) {
            console.error(e);
            await interaction.followUp(res.danger(`${icon.error} | Um erro ocorreu ao executar esse comando: **${e.message || e}**`));
        }
    }
});