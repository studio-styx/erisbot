import { createResponder, ResponderType, Store } from "#base";
import { res, icon, resv2 } from "#functions";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";
import { redis } from "#database";
import { createModalFields } from "@magicyan/discord";
import { roleMention, TextInputStyle } from "discord.js";
import { menus } from "#menus";

const selectedRoles = new Store<string[]>()

createResponder({
    customId: "giveaway/manage/:type/roleEntries/:userId",
    types: [ResponderType.RoleSelect, ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    parse(params) {
        return {
            type: params.type as "roleSelect" | "otherRole",
            userId: params.userId,
        }
    },
    async run(interaction, { type, userId }) {
        const { user, message, client } = interaction;
        if (user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando!`))
            return;
        }

        const key = `giveaway:manage:${message.id}`;

        if (type === "otherRole") {
            if (interaction.isButton()) {
                interaction.showModal({
                    customId: `giveaway/manage/otherRole/roleEntries/${userId}`,
                    title: "Outro cargo",
                    components: createModalFields({
                        roleId: {
                            label: "id do cargo que receberá mais entradas",
                            placeholder: "1234567....",
                            style: TextInputStyle.Short,
                            required: true,
                        },
                        entries: {
                            label: "quantidade de entradas",
                            placeholder: "2",
                            style: TextInputStyle.Short,
                            required: true,
                        }
                    }),
                });
            } else if (interaction.isModalSubmit()) {
                const roleId = interaction.fields.getTextInputValue("roleId");
                const entries = Number(interaction.fields.getTextInputValue("entries"));

                if (Number.isNaN(entries)) {
                    interaction.reply(res.danger(`${icon.error} | Digite um número de entradas válido!`));
                    return;
                }
                if (entries < 2) {
                    interaction.reply(res.danger(`${icon.error} | O número de entradas deve ser maior que 1 (2 ou mais)`));
                    return;
                }

                await interaction.deferUpdate();
                const raw = await redis.get(key);
                if (!raw) {
                    interaction.editReply(resv2.danger(`${icon.Eris_cry} | Parece que você demorou demais para setar as configurações do sorteio! as informações sobre o sorteio sumiram!`));
                    return;
                }
                const giveawayData = JSON.parse(raw, (key, value) => {
                    // Converte strings de data de volta para objetos Date
                    if (key === 'expiresAt' && typeof value === 'string') {
                        return new Date(value);
                    }
                    return value;
                }) as GiveawayManageDataInfo;
                const connectedGuilds = giveawayData.connectedGuilds;
                if (!connectedGuilds || connectedGuilds.length < 1) {
                    await interaction.followUp(res.danger(`${icon.error} | Para definir id de cargos de outros servers, primeiro você precisa setar os servidores que farão parte do sorteio!`));
                    await interaction.editReply(menus.giveaway.giveawayManage(userId, giveawayData, "main"));
                    return;
                }

                const existingRole = giveawayData.roleEntries?.find(entry => entry.roleId === roleId)

                if (existingRole && existingRole.entries === entries) {
                    interaction.followUp(res.danger(`${icon.error} | Esse cargo já está registrado com a mesma quantidade de entradas configuradas`))
                    return;
                }

                const roleInfo: { roleName?: string; roleId?: string } = {}
                for (const connectedGuild of connectedGuilds) {
                    const guild = client.guilds.cache.get(connectedGuild.guildId);
                    if (!guild) continue;
                    const role = await guild.roles.fetch(roleId);
                    if (!role) continue;
                    roleInfo.roleName = role.name;
                    roleInfo.roleId = role.id;
                    break;
                }

                if (!roleInfo.roleId) {
                    interaction.followUp(res.danger(`${icon.error} | Entre os servidores conectados, em nenhum deles eu encontrei o cargo com esse id! se por algum acaso ele existe mas no servidor principal, por favor usar o menu de seleção de cargos, e se necessário usar a função de pesquisa.`))
                    return;
                }

                const newEntry = {
                    entries,
                    roleId: roleInfo.roleId!,
                    roleName: roleInfo.roleName ?? ""
                };
                const updatedEntries = [
                    ...(giveawayData.roleEntries || []).filter(entry => entry.roleId !== roleInfo.roleId),
                    newEntry
                ];
                giveawayData.roleEntries = updatedEntries;
                await redis.setex(key, 3600, JSON.stringify({
                    ...giveawayData,
                    expiresAt: giveawayData.expiresAt?.toISOString() // Converte Date para string
                }));

                interaction.editReply(menus.giveaway.giveawayManage(userId, giveawayData, "main"));
                return;
            }
            return;
        }
        if (type === "roleSelect") {
            if (interaction.isRoleSelectMenu()) {
                const roles = interaction.values;
                selectedRoles.set(message.id, roles, { time: 1000 * 60 * 3 });
                interaction.showModal({
                    customId: `giveaway/manage/roleSelect/roleEntries/${userId}`,
                    title: "Quantidade de entradas",
                    components: createModalFields({
                        entries: {
                            label: "quantidade de entradas",
                            placeholder: "2",
                            style: TextInputStyle.Short,
                            required: true,
                        }
                    }),
                });
            } else if (interaction.isModalSubmit()) {
                try {
                    const entries = Number(interaction.fields.getTextInputValue("entries"));

                    if (Number.isNaN(entries)) {
                        interaction.reply(res.danger(`${icon.error} | Digite um número de entradas válido!`));
                        return;
                    }
                    if (entries < 2) {
                        interaction.reply(res.danger(`${icon.error} | O número de entradas deve ser maior que 1 (2 ou mais)`));
                        return;
                    }

                    const rolesIds = selectedRoles.get(message.id);
                    if (!rolesIds) {
                        interaction.reply(res.danger(`${icon.error} | Você demorou demais para definir a quantidade de entradas dos cargos selecionados, os dados dos cargos sumiram!`));
                        return;
                    }

                    await interaction.deferUpdate();
                    const raw = await redis.get(key);
                    if (!raw) {
                        interaction.editReply(resv2.danger(`${icon.Eris_cry} | Parece que você demorou demais para setar as configurações do sorteio! as informações sobre o sorteio sumiram!`));
                        return;
                    }
                    const giveawayData = JSON.parse(raw, (key, value) => {
                        // Converte strings de data de volta para objetos Date
                        if (key === 'expiresAt' && typeof value === 'string') {
                            return new Date(value);
                        }
                        return value;
                    }) as GiveawayManageDataInfo;

                    const roles: { roleName: string; roleId: string; entries: number }[] = []

                    for (const roleId of rolesIds) {
                        let role = interaction.guild.roles.cache.get(roleId) || null;
                        if (!role) role = await interaction.guild.roles.fetch(roleId);
                        if (!role) continue;
                        roles.push({
                            roleId,
                            roleName: role.name,
                            entries
                        })
                    };

                    const updatedRoles = [
                        ...new Map(
                            [...(giveawayData.roleEntries || []), ...roles].map(r => [r.roleId, r])
                        ).values()
                    ];

                    giveawayData.roleEntries = updatedRoles;
                    await redis.setex(key, 3600, JSON.stringify({
                        ...giveawayData,
                        expiresAt: giveawayData.expiresAt?.toISOString() // Converte Date para string
                    }));

                    await interaction.editReply(menus.giveaway.giveawayManage(userId, giveawayData, "roleEntries"));
                    await interaction.followUp(res.success(`${icon.success} | Sucesso ao adicionar os cargos ${rolesIds.map(id => roleMention(id))} com **${entries}** entradas! agora tem: **${updatedRoles.length}** cargos com multiplas entradas, sendo eles: ${updatedRoles.map(r => `**\`${r.roleName}\`**. entradas: **${r.entries}**`).join(", ")}`))
                    return;
                } finally {
                    selectedRoles.delete(message.id)
                }
            }
            return;
        }
    },
});