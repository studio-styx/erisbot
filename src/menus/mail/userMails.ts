import { icon, resv2 } from "#functions";
import { Mails, User } from "#prisma/client";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, time, userMention, type InteractionReplyOptions } from "discord.js";

export function userMailsMenu<R>(mails: Mails[], user: User, page = 0): R {
    if (mails.length === 0) {
        return (resv2.danger(`${icon.error} | Você não tem cartas!`, createRow(
                new ButtonBuilder({
                    customId: `mail/menu/unIgnoreTag/${user.id}`,
                    label: "Desfazer ignorar tags",
                    style: ButtonStyle.Secondary,
                    disabled: user.mailsTagsIgnored.length === 0
                }),
                new ButtonBuilder({
                    customId: `mail/action/enableDmNotification/${user.id}/0`,
                    label: user.dmNotification ? "Desativar dm" : "Ativar dm",
                    style: user.dmNotification ? ButtonStyle.Danger : ButtonStyle.Success
                })
            )
        ) satisfies InteractionReplyOptions) as R;
    }

    const mail = mails[page];
    const mailTags = mail.tags
        .filter(tag => !user.mailsTagsIgnored.includes(tag))
        .map(tag => ({
            label: tag,
            value: tag,
            emoji: "📬"
        })).slice(0, 25)
    const components = [
        `# ${icon.mail} Lista de cartas`,
        createSeparator(),
        brBuilder(
            mail ? mail.content : `Na página ${page + 1} não há uma carta`,
            `-# ${page + 1}/${mails.length}`
        ),
        createSeparator(),
        brBuilder(
            `-# De: ${userMention(mail.userId)}`,
            `-# Enviado em: ${time(mail.createdAt, "D")}`
        ),
        createSeparator(),
        createRow(
            new ButtonBuilder({
                customId: `mail/actionPage/read/${mail.id}/${page}/${user.id}`,
                label: "Marcar como lido",
                style: ButtonStyle.Success,
                disabled: mail.asRead
            }),
            new ButtonBuilder({
                customId: `mail/actionPage/delete/${mail.id}/${page}/${user.id}`,
                label: "Excluir carta",
                style: ButtonStyle.Danger
            })
        ),
        "Atenção, se ignorar as tags você não receberá mais cartas com essas tags.",
        createRow(
            new StringSelectMenuBuilder({
                customId: `mail/actionPage/ignore/${mail.id}/${page}/${user.id}`,
                placeholder: mailTags.length === 0 ? "todas as tags dessa carta foram ignoradas" : "Ignorar tags",
                options: mailTags.length === 0 ? [{ label: "todas as tags dessa carta foram ignoradas", value: "alIgnoratedMailTags" }] : mailTags,
                minValues: 0,
                maxValues: mailTags.length === 0 ? 1 : mailTags.length,
                disabled: mailTags.length === 0
            })
        ),
    ];

    const rows = [
        createRow(
            new ButtonBuilder({
                customId: `mail/list/${page - 1}/${user.id}`,
                label: "Voltar",
                style: ButtonStyle.Secondary,
                disabled: page === 0
            }),
            new ButtonBuilder({
                customId: `mail/list/${page + 1}/${user.id}`,
                label: "Avançar",
                style: ButtonStyle.Success,
                disabled: page + 1 >= mails.length
            }),
            new ButtonBuilder({
                customId: `mail/action/deleteall/${user.id}/0`,
                label: mails.find(m => !m.asRead) ? "Você tem cartas não lidas" : "Apagar todas as cartas",
                style: ButtonStyle.Danger,
                disabled: mails.find(m => !m.asRead) ? true : false
            }),
            new ButtonBuilder({
                customId: `mail/menu/unIgnoreTag/${user.id}`,
                label: "Desfazer ignorar tags",
                style: ButtonStyle.Secondary,
                disabled: user.mailsTagsIgnored.length === 0
            }),
            new ButtonBuilder({
                customId: `mail/action/enableDmNotification/${user.id}/${page}`,
                label: user.dmNotification ? "Desativar dm" : "Ativar dm",
                style: user.dmNotification ? ButtonStyle.Danger : ButtonStyle.Success
            })
        )
    ]

    const container = createContainer({
        accentColor: settings.colors.fuchsia,
        components,
    });

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container, ...rows]
    } satisfies InteractionReplyOptions) as R;
}