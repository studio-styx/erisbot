import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { ErisError, icon, resv2 } from "#functions";

createResponder({
    customId: "football/terms/accept/:userId/:date",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            userId: params.userId,
            date: new Date(params.date)
        }
    },
    async run(interaction, { userId, date }) {
        const { user } = interaction;

        if (user.id !== userId) throw new ErisError("Você não pode aceitar os termos de condições pelos outros!");

        const now = new Date();

        // Calcular em segundos o tempo que o usuário levou para aceitar os termos
        const seconds = (now.getTime() - date.getTime()) / 1000;

        if (seconds < 15) throw new ErisError("Você não pode ter lido os termos de condições em menos de 15 segundos!");
        
        await interaction.deferUpdate();

        await prisma.user.upsert({
            where: {
                id: userId
            },
            create: {
                id: userId,
                readFootballBetTerms: true,
                acceptedFootballTermsAt: now
            },
            update: {
                readFootballBetTerms: true,
                acceptedFootballTermsAt: now
            }
        });

        await interaction.editReply(resv2.success(`${icon.success} | Termos de uso aceitos com sucesso! Agora você pode prosseguir com o sistema de apostas.`))
    },
});