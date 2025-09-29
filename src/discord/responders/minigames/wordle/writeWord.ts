import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { getCommandId, icon, res, wordleCreateImage } from "#functions";
import { WordleGame } from "#types/wordleGame.js";
import { createModalFields, createRow } from "@magicyan/discord";
import { AttachmentBuilder, ButtonBuilder, ButtonStyle, TextInputStyle } from "discord.js";

// Função para normalizar letras (remove acentos, exceto para ç)
const normalizeLetter = (letter: string): string => {
    const accentMap: { [key: string]: string } = {
        'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
        'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
        'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
    };
    return accentMap[letter.toLowerCase()] || letter.toLowerCase();
};

// Função para lidar com o caso especial do ç
const handleCedilla = (attemptLetter: string, wordLetter: string, word: string): string => {
    if (attemptLetter.toLowerCase() === 'c' && wordLetter.toLowerCase() === 'ç') {
        return 'ç'; // Trata 'c' como 'ç' se a palavra-alvo tem 'ç' na posição
    }
    if (attemptLetter.toLowerCase() === 'c' && word.includes('ç') && !word.includes('c')) {
        return 'ç'; // Se só há 'ç' na palavra, trata 'c' como 'ç'
    }
    return attemptLetter.toLowerCase(); // Mantém a letra original
};

// Função para normalizar uma palavra completa
const normalizeWord = (word: string, targetWord: string): string => {
    return word.split('').map((letter, i) => {
        const wordLetter = targetWord[i] || '';
        return handleCedilla(letter, wordLetter, targetWord);
    }).map(normalizeLetter).join('');
};

createResponder({
    customId: "wordle/writeWord/:userId",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    async run(interaction, { userId }) {
        const { user } = interaction;
        if (user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Apenas quem iniciou o jogo pode interagir com este botão!`));
            return;
        }

        const raw = await redis.get(`wordle:${user.id}`);
        if (!raw) {
            const wordleCommandId = await getCommandId(interaction, "termo");
            await interaction.reply(res.danger(`${icon.denied} | Você não está em uma partida de termo! Inicie uma com </termo:${wordleCommandId}>`));
            return;
        }
        const game = JSON.parse(raw) as WordleGame;
        if (game.isOver) {
            const wordleCommandId = await getCommandId(interaction, "termo");
            await interaction.reply(res.danger(`${icon.denied} | Esta partida de termo já acabou! Inicie uma nova com </termo:${wordleCommandId}>`));
            return;
        }

        if (interaction.isButton()) {
            interaction.showModal({
                customId: `wordle/writeWord/${user.id}`,
                title: "Termo",
                components: createModalFields({
                    response: {
                        label: "Palavra",
                        placeholder: "Palavra para o jogo",
                        style: TextInputStyle.Paragraph,
                        required: true,
                        minLength: game.word.length,
                        maxLength: game.word.length,
                    },
                }),
            });
            return;
        }

        await interaction.deferUpdate();

        const response = interaction.fields.getTextInputValue("response").toLowerCase().trim();
        if (response.length !== game.word.length) {
            await interaction.reply(res.danger(`${icon.denied} | A palavra deve ter exatamente **${game.word.length}** letras.`));
            return;
        }

        const buffer = await wordleCreateImage(game.word, [...game.attempts, response]);
        const image = new AttachmentBuilder(buffer, { name: "wordle.png" });

        game.attempts.push(response);
        game.lastAttemptAt = new Date();

        // Normalizar response e game.word para verificar vitória
        const normalizedResponse = normalizeWord(response, game.word);
        const normalizedWord = normalizeWord(game.word, game.word);

        if (normalizedResponse === normalizedWord) {
            game.isOver = true;
            game.isWon = true;
            game.endedAt = new Date();
            await interaction.followUp(res.success(
                `${icon.success} | Parabéns! Você adivinhou a palavra **${game.word.toUpperCase()}** corretamente em **${game.attempts.length}** tentativas!`, { flags: [] }
            ));
            await interaction.editReply({ files: [image], components: [createRow(
                new ButtonBuilder({
                    label: "Fim de jogo",
                    customId: `wordle/writeWord/${interaction.user.id}`,
                    style: ButtonStyle.Success,
                    disabled: true,
                })
            )] });
            await Promise.all([
                redis.del(`wordle:${interaction.user.id}`),
                prisma.$transaction([
                    prisma.user.upsert({
                        where: { id: interaction.user.id },
                        create: { id: interaction.user.id },
                        update: {},
                    }),
                    prisma.log.create({
                        data: {
                            message: `Ganhou a partida de termo no servidor **${interaction.guild.name}** em **${game.attempts.length}** tentativas (palavra: ${game.word})`,
                            type: "info",
                            userId: interaction.user.id,
                            level: 1,
                            tags: ["wordle", "won"],
                        }
                    })
                ])
            ]);
            return;
        } else if (game.attempts.length >= game.maxAttempts) {
            game.isOver = true;
            game.endedAt = new Date();
            game.isWon = false;
            await interaction.followUp(res.danger(
                `${icon.denied} | Suas tentativas acabaram! A palavra correta era **${game.word.toUpperCase()}**.`, { flags: [] }
            ));
            await interaction.editReply({ files: [image], components: [createRow(
                new ButtonBuilder({
                    label: "Fim de jogo",
                    customId: `wordle/writeWord/${interaction.user.id}`,
                    style: ButtonStyle.Danger,
                    disabled: true,
                })
            )] });
            await Promise.all([
                redis.del(`wordle:${interaction.user.id}`),
                prisma.$transaction([
                    prisma.user.upsert({
                        where: { id: interaction.user.id },
                        create: { id: interaction.user.id },
                        update: {},
                    }),
                    prisma.log.create({
                        data: {
                            message: `Perdeu uma partida de termo no servidor **${interaction.guild.name}** tentativas: **${game.attempts.length}** (palavra: ${game.word})`,
                            type: "info",
                            userId: interaction.user.id,
                            level: 1,
                            tags: ["wordle", "lose"],
                        }
                    })
                ])
            ]);
            return;
        }

        await Promise.all([
            redis.setex(`wordle:${interaction.user.id}`, 60 * 30, JSON.stringify(game)),
            prisma.log.create({
                data: {
                    message: `Fez a tentativa da palavra: **${response.toUpperCase()}** de termo no servidor **${interaction.guild.name}**`,
                    type: "info",
                    userId: interaction.user.id,
                    level: 1,
                    tags: ["wordle", "attempt"],
                }
            }),
            interaction.editReply({ files: [image] }),
            interaction.followUp(res.success(
                `${icon.success} | Tentativa registrada! Você tem mais **${game.maxAttempts - game.attempts.length}** tentativas.`,
            ))
        ]);
        return;
    },
});