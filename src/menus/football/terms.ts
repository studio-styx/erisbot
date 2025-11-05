import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

export function termsMenu<R>(userId: string): R {
    const container = createContainer(settings.colors.danger,
        brBuilder(
            "## Termos de uso e condições"
        ),
        createSeparator(),
        brBuilder(
            "### Termos de uso",
            "Ao utilizar este sistema, você concorda com os seguintes termos:",
            "- Este sistema é **fictício** e possui caráter **de entretenimento** e **educacional**.",
            "- Nenhum valor real é movimentado; **as moedas (stx)** são puramente virtuais e **sem valor econômico real**.",
            "- O sistema **não promove, incentiva ou representa apostas reais** ou jogos de azar.",
            "- Os resultados e estatísticas apresentados são **simulações** baseadas em dados públicos ou gerados automaticamente.",
            "- Os administradores não se responsabilizam por erros de sistema, falhas técnicas ou interpretações incorretas.",
            "- O descumprimento destes termos pode resultar em **suspensão ou banimento permanente** do acesso."
        ),
        createSeparator(),
        brBuilder(
            "### Condições de uso",
            "- O usuário deve ter **no mínimo 15 anos de idade** e **maturidade suficiente** para compreender o caráter fictício das apostas.",
            "- É proibido tentar utilizar o sistema para **promover apostas com dinheiro real**, **divulgar sites de apostas**, ou **enganar outros usuários**.",
            "- O sistema da **Éris** não coleta nem solicita informações financeiras, bancárias ou pessoais sensíveis.",
            "- O uso deste sistema implica que você compreende que se trata apenas de **simulação lúdica**, sem ganhos ou perdas reais.",
            "- O uso do sistema deve respeitar as **regras da comunidade Discord** e a **legislação local aplicável**."
        ),
        createSeparator(),
        brBuilder(
            "Ao clicar em **Aceitar**, você confirma que leu e compreendeu os termos e condições acima, e que está de acordo com eles."
        ),
        createRow(
            new ButtonBuilder({
                customId: `football/terms/accept/${userId}/${new Date().getTime()}`,
                label: "Aceitar",
                style: ButtonStyle.Success
            })
        )
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}
