import { icon } from "#functions";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator, createTextDisplay } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

export function fishMenu<R>(userId: string, rodId: number, round: number = 1, button?: number, disableButtons: boolean = false): R {
    const container = createContainer(settings.colors.azoxo,
        createTextDisplay(`## Pescaria | ${round}`, rodId),
        createSeparator(),
        brBuilder(
            "Pesque peixes e venda-os para ganhar dinheiro!",
            "Você deve esperar até um dos botões ficar **verde** para clicar nele.",
            "Quanto mais rápido você clicar, melhor será o peixe que você pegará.",
            "Você pode comprar varas de pescar melhores na loja para aumentar suas chances de pegar peixes melhores."
        ),
        createSeparator(),
        createRow(
            new ButtonBuilder({
                customId: `fishing/fish/1/${userId}/${new Date().getTime()}/${button === 1}`,
                label: "Pescar",
                style: button === 1 ? ButtonStyle.Success : ButtonStyle.Secondary,
                emoji: icon.pinkfish,
                disabled: disableButtons
            }),
            new ButtonBuilder({
                customId: `fishing/fish/2/${userId}/${new Date().getTime()}/${button === 2}`,
                label: "Pescar",
                style: button === 2 ? ButtonStyle.Success : ButtonStyle.Secondary,
                emoji: icon.pinkfish,
                disabled: disableButtons
            }),
            new ButtonBuilder({
                customId: `fishing/fish/3/${userId}/${new Date().getTime()}/${button === 3}`,
                label: "Pescar",
                style: button === 3 ? ButtonStyle.Success : ButtonStyle.Secondary,
                emoji: icon.pinkfish,
                disabled: disableButtons
            }),
            new ButtonBuilder({
                customId: `fishing/fish/4/${userId}/${new Date().getTime()}/${button === 4}`,
                label: "Pescar",
                style: button === 4 ? ButtonStyle.Success : ButtonStyle.Secondary,
                emoji: icon.pinkfish,
                disabled: disableButtons
            }),
            new ButtonBuilder({
                customId: `fishing/fish/5/${userId}/${new Date().getTime()}/${button === 5}`,
                label: "Pescar",
                style: button === 5 ? ButtonStyle.Success : ButtonStyle.Secondary,
                emoji: icon.pinkfish,
                disabled: disableButtons
            }),
        )
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}