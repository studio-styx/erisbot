import { registerLog } from "#functions";
import { Prisma, PrismaClient } from "#prisma/client";
import { settings } from "#settings";
import { icon, res } from "#utils";
import { createEmbed } from "@magicyan/discord";
import { ChatInputCommandInteraction } from "discord.js";
import i18next from "i18next";

const prisma = new PrismaClient();

export async function cassinoEconomyCommands(interaction: ChatInputCommandInteraction<"cached">) {
    const { options, user: author } = interaction;

    await i18next.changeLanguage(interaction.locale);

    switch(options.getSubcommand()) {
        case "horse-racing": {
            let amount = options.getNumber("amount", true);
            const horse = options.getString("horse", true) as "purple" | "blue" | "green" | "yellow" | "orange" | "red" | "pink" | "brown";
        
            const t = (key: string, options?: any) => i18next.t(`commands/cassino:horse_racing.${key}`, { ...options, lng: interaction.locale });
        
            await interaction.deferReply();
        
            const user = await prisma.user.upsert({
                where: { id: author.id },
                update: {},
                create: { id: author.id }
            });
        
            if (amount > user.money.toNumber()) amount = user.money.toNumber();
            if (amount < 50) {
                interaction.editReply(res.danger(t('min_bet_error', { icon: icon.denied }) as string));
                return;
            }
        
            // Configuração dos cavalos
            const horses = {
                purple: { name: t('horses.purple'), emoji: "🐎", colorEmoji: "🟣", position: 0 },
                blue: { name: t('horses.blue'), emoji: "🐎", colorEmoji: "🔵", position: 0 },
                green: { name: t('horses.green'), emoji: "🐎", colorEmoji: "🟢", position: 0 },
                yellow: { name: t('horses.yellow'), emoji: "🐎", colorEmoji: "🟡", position: 0 },
                orange: { name: t('horses.orange'), emoji: "🐎", colorEmoji: "🟠", position: 0 },
                red: { name: t('horses.red'), emoji: "🐎", colorEmoji: "🔴", position: 0 },
                pink: { name: t('horses.pink'), emoji: "🐎", colorEmoji: "🌸", position: 0 },
                brown: { name: t('horses.brown'), emoji: "🐎", colorEmoji: "🟤", position: 0 }
            };
        
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
        
            // Função para criar o embed da corrida
            const createRaceEmbed = (winner?: string) => {
                const embedData: any = {
                    title: winner ? t('embed.finished_title') : t('embed.race_title'),
                    description: createRaceTrack(),
                    color: winner ? (winner === horse ? "#2ecc71" : "#e74c3c") : "#3498db"
                };
        
                if (winner) {
                    embedData.fields = [
                        { name: t('embed.winner'), value: `${horses[winner as keyof typeof horses].emoji} ${horses[winner as keyof typeof horses].name}`, inline: true },
                        { name: t('embed.your_bet'), value: `${horses[horse].emoji} ${horses[horse].name}`, inline: true },
                        { 
                            name: t('embed.result'), 
                            value: winner === horse 
                                ? t('embed.win_message', { 
                                    icon: icon.success, 
                                    winAmount: (amount * 0.5).toFixed(2), 
                                    totalAmount: (amount * 1.3).toFixed(2) 
                                })
                                : t('embed.lose_message', { icon: icon.denied, amount }), 
                            inline: false 
                        }
                    ];
                }
        
                return createEmbed(embedData);
            };
        
            // Atualizar o saldo do usuário
            const updateUserMoney = async (win: boolean) => {
                const newAmount = win ? user.money.add(new Prisma.Decimal(amount * 1.5)) : user.money.sub(new Prisma.Decimal(amount));
                
                await prisma.user.update({
                    where: { id: author.id },
                    data: { money: newAmount }
                });
            };
        
            // Enviar embed inicial
            let raceMessage = await interaction.editReply({ embeds: [createRaceEmbed()] });
        
            // Função para mover os cavalos
            const moveHorses = async () => {
                const raceFinished = Object.values(horses).some(h => h.position >= 14);
                if (raceFinished) return;
        
                // Mover cada cavalo aleatoriamente
                for (const key of Object.keys(horses) as Array<keyof typeof horses>) {
                    if (Math.random() > 0.3) { // 70% de chance de se mover
                        horses[key].position += 1 + Math.floor(Math.random() * 2); // Move 1-2 posições
                    }
                }
        
                // Atualizar a mensagem
                await interaction.editReply({ embeds: [createRaceEmbed()] });
        
                // Verificar se algum cavalo ganhou
                const winner = Object.entries(horses).find(([_, h]) => h.position >= 14)?.[0];
                if (winner) {
                    const userWon = winner === horse;
                    await updateUserMoney(userWon);
                    await interaction.editReply({ embeds: [createRaceEmbed(winner)] });
                    if (userWon) {
                        await registerLog(
                            t('log.win', { horse, amount: (amount * 1.5).toFixed(2) }) as string,
                            "info",
                            6,
                            author.id,
                            "cassino"
                        )
                    } else {
                        await registerLog(
                            t('log.lose', { horse, amount }) as string,
                            "info",
                            6,
                            author.id,
                            "cassino"
                        )
                    }
                    return;
                }
        
                // Continuar a corrida
                setTimeout(moveHorses, 2000);
            };
        
            // Iniciar a corrida
            setTimeout(moveHorses, 2000);
            return;
        }
        case "coinflip": {
            let amount = options.getNumber("amount", true);
            const side = options.getString("side", true) as 'heads' | 'tails';
        
            const user = await prisma.user.findUnique({ where: { id: author.id } });
        
            const t = (key: string, options?: any): string => i18next.t(`commands/cassino:coinflip.${key}`, { ...options, lng: interaction.locale }) as string;
        
            if (!user || user.money.toNumber() < 15) {
                interaction.reply(res.danger(t('insufficient_funds', { icon: icon.denied })));
                return;
            }
        
            if (user.money.toNumber() < amount) amount = user.money.toNumber();
        
            let coinflipResult: string;
            coinflipResult = Math.random() < 0.5 ? 'heads' : 'tails';
        
            if (coinflipResult === side) {
                interaction.reply(res.success(t('win', {
                    icon: icon.success,
                    result: coinflipResult,
                    amount: amount * 0.2
                })));
                await prisma.user.update({
                    where: { id: author.id },
                    data: { money: { increment: amount * 0.2 } }
                });
                await registerLog(
                    t('log.win', { side, amount: amount * 0.2 }),
                    "info",
                    6,
                    interaction.user.id,
                    "cassino"
                );
                return;
            } else {
                interaction.reply(res.danger(t('lose', {
                    icon: icon.denied,
                    result: coinflipResult,
                    amount
                })));
                await prisma.user.update({
                    where: { id: author.id },
                    data: { money: { decrement: amount } }
                });
                await registerLog(
                    t('log.lose', { side, amount }),
                    "info",
                    6,
                    interaction.user.id,
                    "cassino"
                );
                return;
            }
        }
        
        case "slots": {
            let amount = options.getNumber("amount", true);
            await interaction.deferReply({ flags });
        
            const user = await prisma.user.findUnique({ where: { id: author.id } });
            const t = (key: string, options?: any): string => i18next.t(`commands/cassino:slots.${key}`, { ...options, lng: interaction.locale }) as string;
        
            if (!user || user.money.toNumber() < 25) {
                interaction.editReply(res.danger(t('insufficient_funds', { icon: icon.denied })));
                return;
            }
            
            if (user.money.toNumber() < amount) amount = user.money.toNumber();
        
            const slots = ["🍒", "🍊", "🍋", "🍉", "🍇", "🍓", "🍎", "🍐"];
            const jackpotChance = 0.15;
            const isForcedJackpot = Math.random() < jackpotChance;
            let slot1: string, slot2: string, slot3: string;
        
            if (isForcedJackpot) {
                const winningSymbol = slots[Math.floor(Math.random() * slots.length)];
                slot1 = slot2 = slot3 = winningSymbol;
            } else {
                slot1 = slots[Math.floor(Math.random() * slots.length)];
                slot2 = slots[Math.floor(Math.random() * slots.length)];
                slot3 = slots[Math.floor(Math.random() * slots.length)];
            }
        
            const isWin = slot1 === slot2 && slot2 === slot3;
        
            // Embed inicial
            const embed = createEmbed({
                title: t('embed.title') as string,
                description: t('embed.spinning', { slot1, slot2: "-" }),
                color: settings.colors.primary
            });
        
            await interaction.editReply({ embeds: [embed] });
        
            // Animação em 3 etapas
            setTimeout(async () => {
                embed.setDescription(t('embed.spinning', { slot1, slot2 }));
                await interaction.editReply({ embeds: [embed] });
        
                setTimeout(async () => {
                    const winAmount = amount * 0.6;
        
                    embed.setDescription(t(isWin ? 'embed.win' : 'embed.lose', {
                        slot1, slot2, slot3,
                        icon: isWin ? icon.success : icon.denied,
                        amount: isWin ? winAmount : amount
                    }));
                    embed.setColor(isWin ? "#2ecc71" : "#e74c3c");
        
                    await prisma.user.update({
                        where: { id: author.id },
                        data: { money: { [isWin ? "increment" : "decrement"]: isWin ? winAmount : amount } }
                    });
        
                    await registerLog(
                        t(isWin ? 'log.win' : 'log.lose', { amount: isWin ? winAmount : amount }),
                        "info",
                        6,
                        author.id,
                        "cassino"
                    );
        
                    await interaction.editReply({ embeds: [embed] });
                }, 2000);
            }, 2000);
        
            return;
        }
    }
}