import { Store } from "#base";
import { prisma } from "#database";
import { res, registerLog, getRandomNumber, calculateDate, getRandomValue } from "#functions";
import { getLang, translate } from "#locale";
import { Rarity } from "#prisma";
import { ChatInputCommandInteraction } from "discord.js";

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
    const locale = interaction.locale;
    
    const lang = getLang(locale);
    const t = translate.commands.daily[lang];

    const userTrys = trys.get(`${id}:daily`);
    if (userTrys) {
        const messages = t.manyAttempts(userTrys.attempts, userTrys.cooldown);
        if (messages.length === 0) return;
        interaction.reply(res.danger(getRandomValue(messages), { flags: [] }));
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
        interaction.editReply(res.danger(t.cooldown(cooldownData.willEndIn)));
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

    const baseMaxDaily = 100;
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

    const dailyValue = getRandomNumber(30, maxDailyValue);

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

    const messages = t.messages(dailyValue, petName, newUser);

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