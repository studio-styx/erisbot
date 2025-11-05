import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { getUserInfo, setUserInfo } from "#functions";
import { menus } from "#menus";
import { env } from "#settings";
import { LorittaApiSDK } from "#tools";

const lorittaSDK = new LorittaApiSDK(env.LORITTA_API_KEY);

createResponder({
    customId: "userinfo/menu/:authorId/:userId/:page",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { page, userId, authorId }) {
        if (interaction.user.id !== authorId) {
            await interaction.deferReply({ flags });
        } else {
            await interaction.deferUpdate();
        }

        const cached = getUserInfo(userId);

        const userMember = interaction.user.id === userId ? interaction.member : interaction.guild.members.cache.get(userId) || await interaction.guild.members.fetch(userId).catch(() => null);
        const discordUser = interaction.user.id === userId ? interaction.user : interaction.client.users.cache.get(userId) || await interaction.client.users.fetch(userId);

        if (cached) {
            if (!userMember) {
                await interaction.editReply(menus.user.info(authorId, interaction.user, interaction.member, cached.erisUser, cached.lorittaUser, page as any))
                return;
            }

            await interaction.editReply(menus.user.info(interaction.user.id, discordUser, userMember, cached.erisUser, cached.lorittaUser, page as any))
            return;
        }

        const [lorittaUser, dbUser] = await Promise.all([
            lorittaSDK.user(userId).catch(() => null),
            prisma.user.upsert({
                where: {
                    id: userId
                },
                include: {
                    activePet: true,
                    pets: true,
                    fishs: true,
                    giveaways: true,
                    favoriteTeam: true
                },
                create: {
                    id: userId
                },
                update: {}
            })
        ]);

        setUserInfo(userId, { erisUser: dbUser, lorittaUser })

        if (!userMember) {
            await interaction.editReply(menus.user.info(authorId, interaction.user, interaction.member, dbUser, lorittaUser, page as any))
            return;
        }

        await interaction.editReply(menus.user.info(authorId, discordUser, userMember, dbUser, lorittaUser, page as any))
        return;
    },
});