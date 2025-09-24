import { createResponder, ResponderType } from "#base";
import { getCommandId, icon, res, resv2 } from "#functions";
import { redis } from "#database";

createResponder({
    customId: "wordle/deleteGame/:userId",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { userId }) {
        if (interaction.user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Apenas quem iniciou o jogo pode interagir com este botão!`));
            return;
        }

        await interaction.deferUpdate();

        const [raw, commandId] = await Promise.all([
            redis.get(`wordle:${interaction.user.id}`),
            getCommandId(interaction, "termo"),
        ]);

        if (!raw) {
            await interaction.editReply(resv2.danger(`${icon.denied} | Você não está em uma partida de termo! Inicie uma com </termo:${commandId}>`));
            return;
        }
        
        await redis.del(`wordle:${interaction.user.id}`);
        
        await interaction.editReply(resv2.success(`${icon.success} | Sua partida de termo foi deletada com sucesso! Você pode iniciar uma nova com </termo:${commandId}>`));
        return;
    },
});