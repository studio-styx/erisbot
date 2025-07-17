import { prisma } from "#database";
import { BlackjackIA, Humor, icon, registerLog, res, setBlackjackGame } from "#functions";
import { Prisma } from "#prisma/client";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from "discord.js";

export async function cassinoEconomyCommands(interaction: ChatInputCommandInteraction<"cached">) {
    const { options, user: author } = interaction;

    switch(options.getSubcommand()) {
        case "horse-racing": {
            let amount = options.getNumber("amount", true);
            const horse = options.getString("horse", true) as "purple" | "blue" | "green" | "yellow" | "orange" | "red" | "pink" | "brown";
        
            await interaction.deferReply();
        
            const user = await prisma.user.upsert({
                where: { id: author.id },
                update: {},
                create: { id: author.id }
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
                                ? `${icon.success} | Você apostou **${amount}** e ganhou ${amount * 1.5} stx!`
                                : `${icon.denied} | Você apostou **${amount}** e infelizmente perdeu ${icon.Eris_cry_left}`, 
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
                            `Apostou no cavalo ${horse} e ganhou ${amount * 1.5} stx`,
                            "info",
                            6,
                            author.id,
                            "cassino"
                        )
                    } else {
                        await registerLog(
                            `Apostou no cavalo ${horse} e perdeu ${amount} stx`,
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
        
            if (!user || user.money.toNumber() < 15) {
                interaction.reply(res.danger(`${icon.denied} | Você não tem dinheiro suficiente para apostar.`));
                return;
            }
        
            if (user.money.toNumber() < amount) amount = user.money.toNumber();
        
            let coinflipResult: string;
            coinflipResult = Math.random() < 0.5 ? 'heads' : 'tails';
        
            if (coinflipResult === side) {
                interaction.reply(res.success(`${icon.Eris_enchanted} | A moeda caiu em ${side}, você ganhou **${amount}** STX!`));
                await prisma.user.update({
                    where: { id: author.id },
                    data: { money: { increment: amount * 0.2 } }
                });
                await registerLog(
                    `Apostou na moeda do lado ${side} e ganhou ${amount} stx`,
                    "info",
                    6,
                    interaction.user.id,
                    "cassino"
                );
                return;
            } else {
                interaction.reply(res.danger(`${icon.Eris_shy} | A moeda caiu em ${coinflipResult}, você perdeu **${amount}** STX!`));
                await prisma.user.update({
                    where: { id: author.id },
                    data: { money: { decrement: amount } }
                });
                await registerLog(
                    `Apostou na moeda do lado ${side} e perdeu ${amount} stx`,
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
        
            if (!user || user.money.toNumber() < 25) {
                interaction.editReply(res.danger(`${icon.denied} | Você não tem dinheiro suficiente para apostar.`));
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
                title: "🎰 Caça-Níqueis",
                description: `${slot1} | ${slot2} | - \n\nGirando...`,
                color: settings.colors.primary
            });
        
            await interaction.editReply({ embeds: [embed] });
        
            // Animação em 3 etapas
            setTimeout(async () => {
                embed.setDescription(`${slot1} | ${slot2} | - \n\nGirando...`);
                await interaction.editReply({ embeds: [embed] });
        
                setTimeout(async () => {
                    const winAmount = amount * 0.6;
        
                    embed.setDescription(isWin ? `${slot1} | ${slot2} | ${slot3}\n\n${icon.success} **JACKPOT!** Você ganhou **${winAmount}** STX!`
                        : `${slot1} | ${slot2} | ${slot3}\n\nVocê perdeu **${amount}** STX.`
                    );
                    embed.setColor(isWin ? "#2ecc71" : "#e74c3c");
        
                    await prisma.user.update({
                        where: { id: author.id },
                        data: { money: { [isWin ? "increment" : "decrement"]: isWin ? winAmount : amount } }
                    });
        
                    await registerLog(
                        isWin ? `Ganhou ${winAmount} stx no cassino` : `Perdeu ${amount} stx no cassino`,
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
        case "blackjack": {
            await interaction.deferReply();

            let amount = options.getNumber("amount", true);
            const user = await prisma.user.findUnique({ where: { id: author.id } });
            if (!user) {
                interaction.editReply(res.danger(`${icon.denied} | Você não tem dinheiro suficiente para apostar.`));
                return;
            }
            if (user.money.toNumber() < amount) amount = user.money.toNumber();
            if (user.money.toNumber() < 50) {
                interaction.editReply(res.danger(`${icon.denied} | Você não tem dinheiro suficiente para apostar.`));
                return;
            }

            const emotions: Humor[] = ["angry", "happy", "sad", "neutral", "scared", "surprised", "confused"];

            const game = new BlackjackIA(emotions[Math.floor(Math.random() * emotions.length)], 0.3)
            game.startGame();
            
            const embed = createEmbed({
                title: "🃏 Blackjack",
                description: `Você irá jogar contra éris!`,
                fields: [
                    { name: "Humor da Éris", value: game.getErisHumor() },
                    { name: "Cartas da Éris", value: game.getErisCards().map(__ => "?").join(", ") },
                    { name: "Sua mão", value: game.calculateHandValue(game.getUserCards()).toString() },
                    { name: "Cartas restantes no deck", value: game.getRemainingCards().length.toString() },
                    { name: "Valor apostado", value: amount.toString() }
                ],
                color: settings.colors.fuchsia
            });

            const components = [
                createRow(
                    new ButtonBuilder({
                        customId: `blackjack/${author.id}/getCard/${amount}`,
                        label: "Pegar uma carta", 
                        style: ButtonStyle.Success
                    }),
                    new ButtonBuilder({
                        customId: `blackjack/${author.id}/pass/${amount}`,
                        label: "Passar",
                        style: ButtonStyle.Danger
                    })
                )
            ];
            
            setBlackjackGame(author.id, game);

            await interaction.editReply({ embeds: [embed], components: components });
        }
    }
}