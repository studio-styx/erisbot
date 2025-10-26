import { res, icon } from "#functions";
import { Company } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

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
                    job.flags.filter(f => f.startsWith("EVENT_")).length > 0 ? `> **Evento:** ${job.flags.filter(f => f.startsWith("EVENT_")).map(f => f.replace("EVENT_", "").replaceAll("_", " ")).join(", ")}` : null,
                    job.flags.filter(f => f === "100%_SITUATION").length > 0 ? `> **Chance de desafio:** 100% garantida` : null,
                    job.flags.filter(f => f === "NO_SITUATION").length > 0 ? `> **Chance de desafio:** 0%` : null,
                    job.flags.filter(f => f === "NO_INTERVIEW").length > 0 ? `> **Entrevista não é necessária**` : null,
                    job.flags.filter(f => !f.startsWith("EVENT_") && f !== "100%_SITUATION" && f !== "NO_SITUATION").length > 0 ? `> **Flags:** ${job.flags.filter(f => !f.startsWith("EVENT_") && f !== "100%_SITUATION" && f !== "NO_SITUATION").join(", ")}` : null,
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