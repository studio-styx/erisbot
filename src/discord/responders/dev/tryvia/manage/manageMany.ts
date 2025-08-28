import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { resv2 } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "devMenu/tryvia/:action",
    types: [ResponderType.StringSelect], cache: "cached",
    async run(interaction, { action }) {
        const { values } = interaction;

        const ids = values.map(v => parseInt(v));

        await interaction.deferUpdate();

        switch (action) {
            case "deleteMany": {
                await prisma.tryviaQuestions.deleteMany({
                    where: {
                        id: {
                            in: ids
                        }
                    }
                });

                interaction.editReply(menus.dev.dashboard())
                interaction.followUp(resv2.success("Perguntas deletadas com sucesso!"));
                return;
            }
            case "approveMany": {
                await prisma.tryviaQuestions.updateMany({
                    where: {
                        id: {
                            in: ids
                        }
                    },
                    data: {
                        status: "APPROVED"
                    }
                });

                interaction.editReply(menus.dev.dashboard())
                interaction.followUp(resv2.success("Perguntas aprovadas com sucesso!"));
                return;
            }
        }
    },
});