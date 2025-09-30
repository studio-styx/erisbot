import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, res, verifyPetName } from "#functions";

createResponder({
    customId: "pet/spin/:action/:userId/:petId",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    async run(interaction, { action, userId, petId }) {
        const { user } = interaction;
        if (user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando! não venha roubar pet dos outros!`))
            return;
        }

        if (interaction.isModalSubmit()) {
            const { fields } = interaction;
            const name = fields.getTextInputValue("name");
            // verificar se o nome possui algo de errado
            const errors = verifyPetName(name);
            if (errors.length > 0) {
                interaction.reply(res.danger(`${icon.denied} | ${errors.map(e => `**\`${e}\`**`).join(", ")}**`))
            } else {
                interaction.deferUpdate();
                try {
                    await prisma.userPet.update({
                        where: { id: Number(petId) },
                        data: { name }
                    });

                    interaction.editReply(res.success(`${icon.success} | Você trocou o nome de seu pet para **${name}**!`))
                } catch (e) {
                    console.error(e)
                    interaction.editReply(res.danger(`${icon.error} | Um erro misterioso ocorreu! certifique-se que seu pet ainda existe!`));
                }
            }
            return;
        }
    },
});