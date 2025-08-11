import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator, createSection } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

interface RankedMember {
    id: string;
    xp: number;
}

interface GuildMemberInfo {
    id: string;
    displayName: string;
    avatarUrl?: string;
}

export function rankMenu<R>(
    rank: RankedMember[],
    userId: string,
    guildMembers: GuildMemberInfo[],
    page: number = 0
): R {
    const inicial = page * 10;
    const final = inicial + 10;

    // Posição do usuário no ranking
    const position = rank.findIndex(m => m.id === userId) + 1;

    // Lista de linhas (texto puro)
    const lines = rank.map((m, i) => {
        const user = guildMembers.find(u => u.id === m.id);
        return `-> ${i + 1}. **${user?.displayName || "Unknown user"}** - ${m.xp} xp ${m.id === userId ? '**`(você)`**' : ""}`;
    });

    const components: (string | ReturnType<typeof createSeparator> | ReturnType<typeof createSection>)[] = [
        brBuilder("## Ranking de xp"),
        createSeparator()
    ];

    if (page === 0) {
        const top3String = lines.slice(0, 3).join("\n");

        const firstMember = guildMembers.find(u => u.id === rank[0]?.id);

        if (firstMember?.avatarUrl) {
            components.push(
                createSection({
                    content: top3String,
                    thumbnail: firstMember.avatarUrl
                })
            );
        } else {
            components.push(top3String);
        }

        // Restante (posições 4 a 10)
        const rest = lines.slice(3, 10);

        if (rank.length > 3) {
            components.push(createSeparator(), ...rest);
        }
    } else {
        components.push(...lines.slice(inicial, final));
    }

    if (rank.length > 3) {
        components.push(createSeparator());
    }

    components.push(`-# Sua posição no ranking é: **${position}**`);

    const container = createContainer(settings.colors.azoxo, ...components);

    const row = createRow(
        new ButtonBuilder({
            customId: `xpSystem/rank/${page - 1}/${userId}`,
            label: "Voltar",
            disabled: page === 0,
            style: ButtonStyle.Primary
        }),
        new ButtonBuilder({
            customId: `xpSystem/rank/${page + 1}/${userId}`,
            label: "Avançar",
            disabled: final >= rank.length,
            style: ButtonStyle.Primary
        })
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container, row]
    } satisfies InteractionReplyOptions) as R;
}
