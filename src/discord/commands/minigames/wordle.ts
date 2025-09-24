import { createCommand } from "#base";
import { prisma, redis } from "#database";
import { getWords, icon, resv2, wordleCreateImage } from "#functions";
import { WordleGame } from "#types/wordleGame.js";
import { createRow } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, AttachmentBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

createCommand({
    name: "wordle",
    description: "plays a game of wordle",
    type: ApplicationCommandType.ChatInput,
    nameLocalizations: {
        "pt-BR": "termo",
        "es-ES": "wordle",
    },
    descriptionLocalizations: {
        "pt-BR": "joga uma partida de termo",
        "es-ES": "juega una partida de wordle",
    },
    options: [
        {
            name: "length",
            description: "length of the word",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            minValue: 4,
            maxValue: 6,
            nameLocalizations: {
                "pt-BR": "tamanho",
                "es-ES": "longitud",
            },
            descriptionLocalizations: {
                "pt-BR": "tamanho da palavra",
                "es-ES": "longitud de la palabra",
            },
        },
        {
            name: "language",
            description: "language of the word",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: "Português",
                    value: "ptbr",
                    nameLocalizations: {
                        "es-ES": "Portugués",
                        "pt-BR": "Português",
                        "en-US": "Portuguese",
                    }
                },
                {
                    name: "English",
                    value: "en",
                    nameLocalizations: {
                        "pt-BR": "Inglês",
                        "es-ES": "Inglés",
                    }
                },
                {
                    name: "Español",
                    value: "es",
                    nameLocalizations: {
                        "pt-BR": "Espanhol",
                        "es-ES": "Español",
                        "en-US": "Spanish",
                    }
                }
            ],
            nameLocalizations: {
                "pt-BR": "idioma",
                "es-ES": "idioma",
            },
            descriptionLocalizations: {
                "pt-BR": "idioma da palavra",
                "es-ES": "idioma de la palabra",
            },
        }
    ],
    dmPermission: false,
    async run(interaction) {
        await interaction.deferReply();

        const hasGame = await redis.get(`wordle:${interaction.user.id}`);

        if (hasGame) {
            const game = JSON.parse(hasGame) as WordleGame;
            const linkToMessage = `https://discord.com/channels/${game.guildId}/${game.channelId}/${game.messageId}`;
            await interaction.editReply(resv2.danger(
                `${icon.denied} | Você já está em uma partida de termo! Continue jogando **[aqui](${linkToMessage})**`,
                new ButtonBuilder({
                    label: "Deletar jogo",
                    customId: `wordle/deleteGame/${interaction.user.id}`,
                    style: ButtonStyle.Danger,
                })
            ));
            return;
        }

        const size = interaction.options.getInteger("length");
        const language = interaction.options.getString("language") as "ptbr" | "en" | "es"
            || (interaction.locale === "pt-BR" ? "ptbr" : interaction.locale === "es-ES" ? "es" : "en");
        if (size && (size < 4 || size > 6)) {
            await interaction.editReply(resv2.danger(
                `${icon.denied} | O tamanho da palavra deve ser entre 4 e 6 letras.`
            ));
            return;
        }

        const wordList = await getWords(language, size as 4 | 5 | 6 | undefined);
        
        const chosenWord = wordList[Math.floor(Math.random() * wordList.length)].word.toLowerCase();

        const buffer = await wordleCreateImage(chosenWord, []);
        const image = new AttachmentBuilder(buffer, { name: "wordle.png" });

        const components = [
            createRow(
                new ButtonBuilder({
                    label: "Escrever",
                    customId: `wordle/writeWord/${interaction.user.id}`,
                    style: ButtonStyle.Secondary,
                })
            )
        ];

        const msg = await interaction.editReply({ files: [image], components });

        const newGame: WordleGame = {
            word: chosenWord,
            attempts: [],
            maxAttempts: 5,
            isOver: false,
            isWon: false,
            startedAt: new Date(),
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            messageId: msg.id,
            userId: interaction.user.id,
        };

        await Promise.all([
            redis.setex(`wordle:${interaction.user.id}`, 60 * 30, JSON.stringify(newGame)),
            prisma.$transaction([
                prisma.user.upsert({
                    where: { id: interaction.user.id },
                    create: { id: interaction.user.id },
                    update: {},
                }),
                prisma.log.create({
                    data: {
                        message: `Iniciou uma partida de termo no servidor ${interaction.guild.name})`,
                        type: "info",
                        userId: interaction.user.id,
                        level: 1,
                        tags: ["wordle", "start"],
                    }
                })
            ])
        ])
        return;
    }
});