import { Store } from "#base";
import { prisma } from "#database";
import { icon, res, registerLog, getRandomNumber, calculateDate, getRandomValue } from "#functions";
import { Rarity } from "#prisma";
import { ChatInputCommandInteraction, time } from "discord.js";

const rarityMultipliers: Record<Rarity, { bonus: number, cooldown: number }> = {
    COMUM: { bonus: 1.0, cooldown: 1.0 },
    UNCOMUM: { bonus: 1.2, cooldown: 0.9 },
    RARE: { bonus: 1.5, cooldown: 0.8 },
    EPIC: { bonus: 2.0, cooldown: 0.7 },
    LEGENDARY: { bonus: 3.0, cooldown: 0.5 },
};

function calculateDailyMaxValue(baseMax: number, rarity: Rarity, skillLevel: number) {
    const mult = rarityMultipliers[rarity]?.bonus ?? 1;
    // A cada level da skill, dá +5% sobre o multiplicador base
    const levelMult = 1 + (skillLevel * 0.05);
    return Math.floor(baseMax * mult * levelMult);
}

function calculateDailyCooldown(rarity: Rarity, skillLevel: number) {
    const baseHours = 24;
    const mult = rarityMultipliers[rarity]?.cooldown ?? 1;
    // Cada level reduz mais 2% do tempo, até um limite de 50% da base
    const levelReduction = Math.min(skillLevel * 0.02, 0.5);
    const finalMultiplier = mult - levelReduction;

    const hours = Math.max(baseHours * finalMultiplier, 1); // nunca menos que 1h
    return `${Math.floor(hours)}h`;
}


const trys = new Store<{ attempts: number; cooldown: Date }>();

export async function economyDailyCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const id = interaction.user.id;

    const userTrys = trys.get(`${id}:daily`);
    if (userTrys) {
        if (userTrys.attempts === 1) {
            const messages = [
                `${icon.Eris_thinking} | Ei! eu acho que já te disse pra voltar ${time(userTrys.cooldown, "R")} não foi?`,
                `${icon.Eris_thinking} | Eu acho que já te disse pra voltar ${time(userTrys.cooldown, "R")} não foi?`,
                `${icon.denied} | Por favor volte novamente no horário que eu te disse anteriomente!`,
                `${icon.denied} | Eu já te disse pra voltar ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_thinking} | Calma lá! Você precisa esperar até ${time(userTrys.cooldown, "R")}`,
                `${icon.denied} | Paciência, jovem! Seu próximo daily só ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_thinking} | Hmm, parece que alguém está ansioso! Volte ${time(userTrys.cooldown, "R")}`,
                `${icon.denied} | O daily não cresce em árvore! Espere até ${time(userTrys.cooldown, "R")}`
            ]
            interaction.reply(res.danger(messages[Math.floor(Math.random() * messages.length)], { flags: [] }));
        } else if (userTrys.attempts === 2) {
            const messages = [
                `${icon.Eris_Angry} | Ei! de novo? eu acho que já te disse pra voltar ${time(userTrys.cooldown, "R")} não foi?`,
                `${icon.Eris_Angry} | Eu já te disse pra voltar ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Essa já é a segunda vez que eu disse pra voltar ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Essa já é a segunda vez! por favor volte ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Você tá me zoando? Segunda vez que aviso! Volte ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Tá achando que se insistir eu vou ceder? Volte ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Já cansei de repetir! Segunda vez que falo pra voltar ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Aff, de novo isso? Volte ${time(userTrys.cooldown, "R")} como eu já disse!`
            ]
            interaction.reply(res.danger(messages[Math.floor(Math.random() * messages.length)], { flags: [] }));
        } else if (userTrys.attempts === 3) {
            const messages = [
                `${icon.Eris_Angry} | Ei! você está me testando? já te disse pra voltar${time(userTrys.cooldown, "R")} três vezes!`,
                `${icon.Eris_Angry} | Eu já te disse pra voltar${time(userTrys.cooldown, "R")} três vezes!`,
                `${icon.Eris_Angry} | Essa já é a terceira vez que eu disse pra voltar${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Já chega né? você não vai conseguir outro daily tão rápido assim, volte${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Pela terceira vez: VOLTE ${time(userTrys.cooldown, "R")}!`,
                `${icon.Eris_Angry} | Tá achando que eu sou o Siri? Pare de me perguntar a mesma coisa!`,
                `${icon.Eris_Angry} | Já virou falta de educação! Terceira vez que aviso!`,
                `${icon.Eris_Angry} | Eu devo ter dito umas 300 vezes pra voltar ${time(userTrys.cooldown, "R")}`
            ]
            interaction.reply(res.danger(messages[Math.floor(Math.random() * messages.length)], { flags: [] }));
        } else if (userTrys.attempts === 4) {
            const messages = [
                `${icon.Eris_Angry} | Eu não vou repetir mais isso, por favor volte${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Eu não vou repetir de novo.`,
                `${icon.Eris_Angry} | O objetivo era me irritar? ótimo! conseguiu, agora não volte mais novamente.`,
                `${icon.Eris_Angry} | Mas que coisa! pare com isso! não irei repetir isso!`,
                `${icon.Eris_Angry} | Você está me testando? não vou repetir isso!`,
                `${icon.Eris_Angry} | Já chega, não quero mais falar com você!`,
                `${icon.Eris_Angry} | Chega! Meu limite de paciência acabou!`,
                `${icon.Eris_Angry} | Pronto, cansei! Vou ignorar você até ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Isso já virou assédio! Pare imediatamente!`,
                `${icon.Eris_Angry} | Eu poderia te mutar por spam, sabia? Último aviso!`
            ]
            interaction.reply(res.danger(messages[Math.floor(Math.random() * messages.length)], { flags: [] }));
        } else {
            trys.set(`${id}:daily`, { attempts: userTrys.attempts + 1, cooldown: userTrys.cooldown }, { time: 1000 * 60 * 2 });
            return;
        }
        trys.set(`${id}:daily`, { attempts: userTrys.attempts + 1, cooldown: userTrys.cooldown }, { time: 1000 * 60 * 2 });
        return;
    }

    await interaction.deferReply();

    const now = new Date();

    const cooldownData = await prisma.cooldown.findFirst({
        where: { userId: id, name: "daily" },
        select: { willEndIn: true, id: true }
    });

    if (cooldownData?.willEndIn && cooldownData.willEndIn > now) {
        interaction.editReply(res.danger(`${icon.denied} | Você já pegou seu prêmio diário hoje. Tente novamente ${time(cooldownData.willEndIn, "R")}`));
        trys.set(`${id}:daily`, { attempts: 1, cooldown: cooldownData.willEndIn }, { time: 1000 * 60 * 2 });
        return;
    }

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            money: true,
            activePet: {
                include: {
                    skills: { include: { skill: true } },
                    pet: { select: { rarity: true } }
                }
            }
        }
    });

    const hasDailyBonus = user?.activePet?.skills.some(s => s.skill.name === "daily_bonus");
    const hasDailyDecrementCooldown = user?.activePet?.skills.some(s => s.skill.name === "daily_cooldown_reduction");

    const baseMaxDaily = 50;
    let maxDailyValue = baseMaxDaily;

    if (user?.activePet) {
        const rarity = user.activePet.pet.rarity;
        const dailyBonusSkill = user.activePet.skills.find(s => s.skill.name === "daily_bonus");

        if (dailyBonusSkill) {
            maxDailyValue = calculateDailyMaxValue(
                baseMaxDaily,
                rarity,
                dailyBonusSkill.level
            );
        }
    }

    const dailyValue = getRandomNumber(5, maxDailyValue);

    // Cooldown
    let cooldownTime = "24h";
    const dailyCooldownSkill = user?.activePet?.skills.find(s => s.skill.name === "daily_cooldown_reduction");

    if (dailyCooldownSkill) {
        cooldownTime = calculateDailyCooldown(
            user!.activePet!.pet.rarity,
            dailyCooldownSkill.level
        );
    }

    const willEnd = calculateDate({
        typeCalc: "increment",
        time: cooldownTime as any
    });


    const [_a, _b, newUser] = await prisma.$transaction([
        prisma.user.upsert({
            where: { id },
            create: { id },
            update: {}
        }),
        prisma.cooldown.upsert({
            where: {
                userId_name: {
                    userId: id,
                    name: "daily"
                }
            },
            update: { willEndIn: willEnd },
            create: { name: "daily", userId: id, willEndIn: willEnd }
        }),
        prisma.user.upsert({
            where: { id },
            create: { id },
            update: {
                money: { increment: dailyValue }
            }
        })
    ])

    const petName = user?.activePet?.name ?? "seu pet";

    const messages = {
        petDailyBonus: [
            `${icon.Eris_enchanted} | Você recebeu **${dailyValue}** stx no daily, incluindo um bônus trazido por **${petName}**! Agora você tem **${newUser.money}** stx. ${icon.Eris_ok_left}`,
            `${icon.Eris_enchanted} | Daily coletado: **${dailyValue}** stx (com bônus de **${petName}**) 🐾 Saldo atual: **${newUser.money}** stx.`,
            `${icon.Eris_enchanted} | Prêmio diário recebido (**${dailyValue}** stx)! **${petName}** deu aquela força extra. Total em carteira: **${newUser.money}** stx.`,
            `${icon.Eris_enchanted} | **${petName}** achou umas moedinhas perdidas 🐾 Você recebeu **${dailyValue}** stx no daily! Saldo: **${newUser.money}** stx.`,
            `${icon.Eris_enchanted} | Daily recebido: **${dailyValue}** stx ${icon.money_bag} **${petName}** até abriu a própria carteira 😎 Total: **${newUser.money}** stx.`,
            `${icon.Eris_enchanted} | Daily + bônus de **${petName}** ativado! Você recebeu **${dailyValue}** stx ✨ Saldo atual: **${newUser.money}** stx.`,
            `${icon.Eris_enchanted} | Até **${petName}** trabalha mais que você… Recebeu **${dailyValue}** stx (bônus incluso). Agora tem **${newUser.money}** stx 😏`,
            `${icon.Eris_enchanted} | **${petName}** cavou o quintal e trouxe **${dailyValue}** stx. Você só ficou parado olhando ${icon.paid}`,
            `${icon.Eris_enchanted} | Daily recebido: **${dailyValue}** stx. O bônus foi de **${petName}**, não seu. Total: **${newUser.money}** stx.`
        ],
        petDailyCooldownReduction: [
            `${icon.Eris_enchanted} | Você recebeu **${dailyValue}** stx no daily! **${petName}** ainda reduziu o tempo de espera para o próximo ⏱️`,
            `${icon.Eris_enchanted} | Daily coletado: **${dailyValue}** stx. **${petName}** agilizou o cooldown do próximo daily.`,
            `${icon.Eris_enchanted} | Prêmio diário de **${dailyValue}** stx recebido! **${petName}** mexeu no tempo pra você 😉`,
            `${icon.Eris_enchanted} | **${petName}** foi tão rápido que até o tempo ficou com inveja ⏳ Você recebeu **${dailyValue}** stx!`,
            `${icon.Eris_enchanted} | Daily recebido: **${dailyValue}** stx ${icon.paid} Enquanto isso, **${petName}** hackeou o relógio 🐾⌛`,
            `${icon.Eris_enchanted} | Você ganhou **${dailyValue}** stx e **${petName}** ainda deu um jeitinho no tempo 😎`,
            `${icon.Eris_enchanted} | Daily recebido: **${dailyValue}** stx. Sorte que **${petName}** compensou sua lerdeza e cortou o cooldown 😏`,
            `${icon.Eris_enchanted} | Enquanto você comemorava seus **${dailyValue}** stx, **${petName}** resolveu o relógio. Impressionante.`,
            `${icon.Eris_enchanted} | **${petName}** reduziu o cooldown. Você só pegou os **${dailyValue}** stx. Equilíbrio perfeito 🙄`
        ],
        petDailyBonusAndCooldownReduction: [
            `${icon.Eris_enchanted} | Você recebeu **${dailyValue}** stx (daily + bônus de **${petName}**) e ainda teve o cooldown reduzido 🐾 Saldo: **${newUser.money}** stx.`,
            `${icon.Eris_enchanted} | Daily completo: **${dailyValue}** stx recebidos com bônus + cooldown reduzido graças a **${petName}**.`,
            `${icon.Eris_enchanted} | Prêmio diário de **${dailyValue}** stx recebido com bônus extra e cooldown adiantado. **${petName}** foi incrível hoje.`,
            `${icon.Eris_enchanted} | Jackpot de **${petName}** 🐶💸 Você recebeu **${dailyValue}** stx e o próximo daily vem mais cedo! Total: **${newUser.money}** stx.`,
            `${icon.Eris_enchanted} | **${petName}** ativou modo turbo: **${dailyValue}** stx + bônus + cooldown reduzido 😳`,
            `${icon.Eris_enchanted} | Daily recebido: **${dailyValue}** stx. **${petName}** fez tudo — só faltou te servir café ☕`,
            `${icon.Eris_enchanted} | Nem você merecia tanto: **${dailyValue}** stx recebidos, bônus incluso, e cooldown cortado por **${petName}** 😏`,
            `${icon.Eris_enchanted} | **${petName}** fez o trabalho pesado: dinheiro (**${dailyValue}** stx) e tempo. Você só clicou.`,
            `${icon.Eris_enchanted} | Daily + bônus + cooldown reduzido = **${dailyValue}** stx ganhos. Se dependesse de você, não vinha nada 🐾`
        ],
        normal: [
            `${icon.Eris_enchanted} | Você recebeu **${dailyValue}** stx no daily. Agora possui **${newUser.money}** stx na carteira. ${icon.Eris_ok_left}`,
            `${icon.Eris_enchanted} | Daily coletado com sucesso: **${dailyValue}** stx. Saldo atual: **${newUser.money}** stx.`,
            `${icon.Eris_enchanted} | Prêmio diário de **${dailyValue}** stx recebido ${icon.paid}`,
            `${icon.Eris_enchanted} | Daily coletado ${icon.paid} Você recebeu **${dailyValue}** stx e saiu com o bolso mais feliz 😎`,
            `${icon.Eris_enchanted} | Você deu aquela passada diária e recebeu **${dailyValue}** stx ${icon.money_bag} Total: **${newUser.money}** stx.`,
            `${icon.Eris_enchanted} | A carteira sorriu 🤑 **${dailyValue}** stx direto pra sua conta.`,
            `${icon.Eris_enchanted} | Parabéns… por existir. Aqui estão seus **${dailyValue}** stx 😏`
        ]
    }

    interaction.editReply(res.fuchsia(
        hasDailyBonus && hasDailyDecrementCooldown ? getRandomValue(messages.petDailyBonusAndCooldownReduction)
            : hasDailyBonus ? getRandomValue(messages.petDailyBonus)
                : hasDailyDecrementCooldown ? getRandomValue(messages.petDailyCooldownReduction)
                    : getRandomValue(messages.normal)
    ));

    await registerLog({
        level: 3,
        message: `Recebeu seu prêmio diário de ${dailyValue} stx`,
        tags: ["economy", "daily", "sum", "transaction"],
        type: "info",
        user: id
    });
    return;
}