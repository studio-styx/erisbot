import { Prisma } from "#prisma/client";
import { settings } from "#settings";
import { icon, res } from "#utils";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, type InteractionReplyOptions } from "discord.js";

interface Company {
    description: string | null;
    name: string;
    id: number;
    difficulty: number;
    experience: number;
    wage: Prisma.Decimal;
    expectations: Prisma.JsonValue;
}

export function avaibleJobsMenu<R>(companys: Company[], page: number): R {
    const jobsPerPage = 6;
    const startIndex = page * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const jobs = companys.slice(startIndex, endIndex);

    if (jobs.length === 0) {
        return (res.danger(`${icon.error} | nenhum emprego encontrado`))
    }
    
    const components: any[] = [
        brBuilder(
            "## Centro de empregos",
            "**Verifique abaixo os empregos disponiveis**"
        ),
        createSeparator(),
    ];

    jobs.forEach((job, index) => {
        components.push(
            createSection({
                content: brBuilder(
                    `${startIndex + index + 1}. **${job.name}**`,
                    `> **Dificuldade:** ${job.difficulty}`,
                    `> **Descrição:** ${job.description || "\`sem descrição\`"}`,
                    `> **Xp necessário:** ${job.experience}`,
                    `> **Salário:** Ꞩ ${job.wage}`,
                ),
                button: new ButtonBuilder({
                    customId: `companys/interview/${job.id}`,
                    label: "Participar da entrevista",
                    style: ButtonStyle.Primary,
                })
            })
        );
    
        if (index !== jobs.length - 1) {
            components.push(createSeparator());
        }
    });
    

    const rows = [
        createRow(
            new ButtonBuilder({
                customId: `companys/jobs/${page - 1}`,
                label: "Anterior",
                style: ButtonStyle.Secondary,
                disabled: page === 0
            }),
            new ButtonBuilder({
                customId: `companys/jobs/${page + 1}`,
                label: "Próximo",
                style: ButtonStyle.Primary,
                disabled: endIndex >= companys.length
            })
        )
    ]

    const container = createContainer({
        accentColor: settings.colors.danger,
        components
    });

    return ({
        flags: ["IsComponentsV2"],
        components: [container, ...rows]
    } satisfies InteractionReplyOptions) as R;
}