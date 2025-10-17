import { icon, sanitizeUserName } from "#functions";
import { User as PrismaUser, UserFish, UserGiveaway, UserPet } from "#prisma";
import { settings } from "#settings";
import { LorittaApiSDKUserInfo } from "#types/lorittaApiUserInfoResponse.js";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, GuildMember, roleMention, time, TimestampStyles, User, type InteractionReplyOptions } from "discord.js";

function formatNumber(num: number) {
    return new Intl.NumberFormat("pt-BR").format(num);
}

function abbreviateNumber(num: number) {
    if (num >= 1_000_000_000)
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1_000_000)
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000)
        return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
}

export function userInfoMenu<R>(authorId: string, discordUser: User, memberUser: GuildMember, erisUser: PrismaUser & { activePet: UserPet | null; pets: UserPet[], fishs: UserFish[], giveaways: UserGiveaway[] }, lorittaUser: LorittaApiSDKUserInfo | null, page: "discord" | "eris" | "loritta" | "guild"): R {
    const components: any[] = [
        `# Informações de: ${sanitizeUserName(discordUser.displayName)}`,
        createSeparator()
    ]

    switch (page) {
        case "discord": {
            components.push(
                createSection({
                    content: brBuilder(
                        `## Discord`,
                        `> - **ID:** ${discordUser.id}`,
                        `> - **Conta criada há:** ${time(discordUser.createdAt, TimestampStyles.RelativeTime)} | ${time(discordUser.createdAt, TimestampStyles.LongDate)}`,
                        `> - **Tag:** ${discordUser.tag}`
                    ),
                    thumbnail: discordUser.displayAvatarURL()
                }),
            )
            break;
        }
        case "eris": {
            components.push(
                brBuilder(
                    `## Éris`,
                    `> - **Conhece a Éris dês de:** ${time(erisUser.createdAt, "R")}`,
                    `> - **Pet ativo:** ${erisUser.activePet ? erisUser.activePet.name : "Nenhum"}`,
                    `> - **Quantidade de pets:** ${erisUser.pets.length}`,
                    `> - **Quantidade de peixes:** ${erisUser.fishs.length}`,
                    `> - **Já participou de:** ${erisUser.giveaways.length} sorteios`,
                    `> - **E ganhou:** ${erisUser.giveaways.filter(g => g.isWinner).length} sorteios`
                )
            )
            break;
        }
        case "loritta": {
            if (!lorittaUser) {
                components.push(
                    `Houve algum problema com a api da loritta, então não foi possivel achar as informações ${icon.Eris_cry}`
                )
                break;
            }
            components.push(
                brBuilder(
                    `## Loritta`,
                    `> - **XP:** ${lorittaUser.xp}`,
                    `> - **Sonhos:** ${formatNumber(lorittaUser.sonhos)} - **(${abbreviateNumber(lorittaUser.sonhos)})**`,
                    `> - **Gênero:** ${lorittaUser.gender === "MALE" ? "Masculino" : lorittaUser.gender === "FEMALE" ? "Feminino" : "Não definido"}`,
                    `> - **Sobre:** ${lorittaUser.aboutMe ? `\n \`\`\`\n${lorittaUser.aboutMe}\n\`\`\`` : "Nenhuma"}`,
                    lorittaUser.lorittaBanState ? brBuilder(
                        `> - Está banido da loritta desde: ${time(new Date(lorittaUser.lorittaBanState.bannedAt), "R")}`,
                        lorittaUser.lorittaBanState.expiresAt ? `> - Banido até: ${time(new Date(lorittaUser.lorittaBanState.expiresAt), "R")}` : null,
                        `> - Por: ${lorittaUser.lorittaBanState.reason}`
                    ) : null
                )
            )
            break;
        }
        case "guild": {
            components.push(
                createSection({
                    thumbnail: memberUser.displayAvatarURL(),
                    content: brBuilder(
                        `## Membro`,
                        `> - **Nome:** ${memberUser.displayName}`,
                        memberUser.joinedAt ? `> - **Membro há:** ${time(memberUser.joinedAt, "R")}` : null,
                        `> - **Maior cargo:** ${roleMention(memberUser.roles.highest.id)}`,
                        `> - **Menor cargo:** ${roleMention([...memberUser.roles.cache.values()].reverse()[1]?.id) ?? "Nenhum"}`,
                        `> - **Todos os cargos:** ${memberUser.roles.cache.map(r => roleMention(r.id)).join(", ")}`,
                    )
                })
            )
            break
        }
    }
    
    const container = createContainer({
        accentColor: settings.colors.fuchsia,
        components
    });

    const row = createRow(
        new ButtonBuilder({
            customId: `userinfo/menu/${authorId}/${discordUser.id}/discord`,
            label: "Discord",
            style: page === "discord" ? ButtonStyle.Secondary : ButtonStyle.Primary,
            disabled: page === "discord"
        }),
        new ButtonBuilder({
            customId: `userinfo/menu/${authorId}/${discordUser.id}/eris`,
            label: "Éris",
            style: page === "eris" ? ButtonStyle.Secondary : ButtonStyle.Primary,
            disabled: page === "eris"
        }),
        new ButtonBuilder({
            customId: `userinfo/menu/${authorId}/${discordUser.id}/loritta`,
            label: "Loritta",
            style: page === "loritta" ? ButtonStyle.Secondary : !lorittaUser ? ButtonStyle.Danger : ButtonStyle.Primary,
            disabled: page === "loritta" || !lorittaUser
        }),
        new ButtonBuilder({
            customId: `userinfo/menu/${authorId}/${discordUser.id}/guild`,
            label: "Guild",
            style: page === "guild" ? ButtonStyle.Secondary : ButtonStyle.Primary,
            disabled: page === "guild"
        })
    )

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container, row],
        allowedMentions: {
            parse: []
        }
    } satisfies InteractionReplyOptions) as R;
}