import { prisma } from "#database";
import { res, icon, registerLog } from "#functions";
import { Prisma, Rarity } from "#prisma";
import { createEmbed } from "@magicyan/discord";
import { ChatInputCommandInteraction } from "discord.js";

export async function horseRacingCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options, user: author } = interaction;

    let amount = options.getNumber("amount", true);
    const horse = options.getString("horse", true) as "purple" | "blue" | "green" | "yellow" | "orange" | "red" | "pink" | "brown";

    await interaction.deferReply();

    const user = await prisma.user.upsert({
        where: { id: author.id },
        update: {},
        create: { id: author.id },
        include: {
            activePet: {
                include: {
                    pet: true,
                    skills: { include: { skill: true } }
                }
            }
        }
    });

    if (amount > user.money.toNumber()) amount = user.money.toNumber();
    if (amount < 50) {
        interaction.editReply(res.danger(`${icon.Eris_cry} | Você precisa ter no mínimo 50 STX para apostar.`));
        return;
    }

    // Configuração dos cavalos
    const horses = {
        purple: { name: "Roxo", emoji: "🐎", colorEmoji: "🟣", position: 0 },
        blue: { name: "Azul", emoji: "🐎", colorEmoji: "🔵", position: 0 },
        green: { name: "Verde", emoji: "🐎", colorEmoji: "🟢", position: 0 },
        yellow: { name: "Amarelo", emoji: "🐎", colorEmoji: "🟡", position: 0 },
        orange: { name: "Laranja", emoji: "🐎", colorEmoji: "🟠", position: 0 },
        red: { name: "Vermelho", emoji: "🐎", colorEmoji: "🔴", position: 0 },
        pink: { name: "Rosa", emoji: "🐎", colorEmoji: "🌸", position: 0 },
        brown: { name: "Marrom", emoji: "🐎", colorEmoji: "🟤", position: 0 }
    };

    const horseRacingLuck = user.activePet?.skills.find(s => s.skill.name === "horse_racing_luck");
    const horseRacingBonus = user.activePet?.skills.find(s => s.skill.name === "horse_racing_bonus")

    // Função para criar a pista de corrida
    const createRaceTrack = () => {
        let description = "";
        const trackLength = 15;

        for (const [, h] of Object.entries(horses)) {
            const progress = "―".repeat(trackLength);
            const position = Math.min(h.position, trackLength - 1);
            const track = progress.split("");
            track[position] = h.emoji;

            description += `**${h.name}** ${track.join("")} ${h.colorEmoji}\n`;
        }

        return description;
    };

    // Configuração de probabilidade
    const baseWinChance = 0.2; // 20% base

    const rarityLuckBonus: Record<Rarity, number> = {
        COMUM: 0.02,       // +2%
        UNCOMUM: 0.04,     // +4%
        RARE: 0.06,        // +6%
        EPIC: 0.08,        // +8%
        LEGENDARY: 0.10,   // +10%
    }

    // Calcula a chance total do cavalo apostado ganhar
    let userHorseChance = baseWinChance;

    if (horseRacingLuck && user.activePet) {
        userHorseChance += rarityLuckBonus[user.activePet.pet.rarity] + (horseRacingLuck.level * 0.02);
    }

    // Limite máximo para não ficar muito fácil
    userHorseChance = Math.min(userHorseChance, 0.5); // Máximo 50%

    // Função para determinar o vencedor baseado nas probabilidades
    const determineWinner = (): keyof typeof horses => {
        const random = Math.random();

        // Se cair na chance do cavalo do usuário, ele vence
        if (random < userHorseChance) {
            return horse;
        }

        // Caso contrário, sorteia aleatoriamente entre os outros cavalos
        const otherHorses = Object.keys(horses).filter(h => h !== horse) as Array<keyof typeof horses>;
        const randomIndex = Math.floor(Math.random() * otherHorses.length);
        return otherHorses[randomIndex];
    };

    // Função para mover os cavalos (AGORA COM PROBABILIDADE)
    const moveHorses = async () => {
        const raceFinished = Object.values(horses).some(h => h.position >= 14);
        if (raceFinished) return;

        // Determina antecipadamente o vencedor (mas não revela ainda)
        const predeterminedWinner = determineWinner();

        // Mover cada cavalo, dando vantagem ao vencedor predeterminado
        for (const key of Object.keys(horses) as Array<keyof typeof horses>) {
            let moveChance = 0.7; // Chance base de movimento
            let moveDistance = 1 + Math.floor(Math.random() * 2); // 1-2 posições base

            // Se é o vencedor predeterminado, dá mais vantagem
            if (key === predeterminedWinner) {
                moveChance = 0.9; // 90% de chance de se mover
                moveDistance = 1 + Math.floor(Math.random() * 3); // 1-3 posições
            }

            if (Math.random() < moveChance) {
                horses[key].position += moveDistance;
            }
        }

        // Atualizar a mensagem
        await interaction.editReply({ embeds: [createRaceEmbed()] });

        // Verificar se algum cavalo ganhou
        const actualWinner = Object.entries(horses).find(([_, h]) => h.position >= 14)?.[0] as keyof typeof horses;
        if (actualWinner) {
            const userWon = actualWinner === horse;

            // Aplicar bônus de multiplicador se ganhou
            let winMultiplier = 1.5; // Multiplicador base

            if (userWon && horseRacingBonus && user.activePet) {
                const rarityAmountBonus: Record<Rarity, number> = {
                    COMUM: 0.1,
                    UNCOMUM: 0.2,
                    RARE: 0.3,
                    EPIC: 0.4,
                    LEGENDARY: 0.5
                };

                winMultiplier += rarityAmountBonus[user.activePet.pet.rarity] + (horseRacingBonus.level * 0.05);
                winMultiplier = Math.min(winMultiplier, 3.0); // Limite máximo de 3x
            }

            await updateUserMoney(userWon, winMultiplier);
            await interaction.editReply({
                embeds: [createRaceEmbed(actualWinner, userWon ? winMultiplier : 1.5)]
            });

            if (userWon) {
                await registerLog({
                    level: 6,
                    message: `Apostou no cavalo ${horse} e ganhou ${amount * winMultiplier} stx`,
                    tags: ["cassino", "transaction", "horse-racing", "sum"],
                    type: "info",
                    user: author.id
                });
            } else {
                await registerLog({
                    level: 6,
                    message: `Apostou no cavalo ${horse} e perdeu ${amount} stx`,
                    tags: ["cassino", "transaction", "horse-racing", "sub"],
                    type: "info",
                    user: author.id
                });
            }
            return;
        }

        // Continuar a corrida
        setTimeout(moveHorses, 2000);
    };

    const updateUserMoney = async (win: boolean, multiplier: number = 1.5) => {
        const newAmount = win ? user.money.add(new Prisma.Decimal(amount * multiplier)) : user.money.sub(new Prisma.Decimal(amount));

        await prisma.user.update({
            where: { id: author.id },
            data: { money: newAmount }
        });
    };

    const createRaceEmbed = (winner?: string, multiplier: number = 1.5) => {
        const embedData: any = {
            title: winner ? "🏁 Corrida Finalizada!" : "🏇 Corrida de Cavalos",
            description: createRaceTrack(),
            color: winner ? (winner === horse ? "#2ecc71" : "#e74c3c") : "#3498db"
        };

        if (winner) {
            embedData.fields = [
                { name: "Vencedor", value: `${horses[winner as keyof typeof horses].emoji} ${horses[winner as keyof typeof horses].name}`, inline: true },
                { name: "Sua aposta", value: `${horses[horse].emoji} ${horses[horse].name}`, inline: true },
                {
                    name: "Resultado",
                    value: winner === horse
                        ? `${icon.success} | Você apostou **${amount}** e ganhou ${amount * multiplier} stx!`
                        : `${icon.denied} | Você apostou **${amount}** e infelizmente perdeu ${icon.Eris_cry_left}`,
                    inline: false
                }
            ];
        }

        return createEmbed(embedData);
    };

    // Iniciar a corrida
    setTimeout(moveHorses, 2000);
    return;
}