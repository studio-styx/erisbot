import { createCommand } from "#base";
import { prisma, redis } from "#database";
import { icon, resv2, wordleCreateImage } from "#functions";
import { WordleGame } from "#types/wordleGame.js";
import { createRow } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, AttachmentBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

createCommand({
    name: "termo",
    description: "jogar uma partida de termo",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "tamanho",
            description: "tamanho da palavra (4-6 letras)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            minValue: 4,
            maxValue: 6,
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

        const size = interaction.options.getInteger("tamanho");
        if (size && (size < 4 || size > 6)) {
            await interaction.editReply(resv2.danger(
                `${icon.denied} | O tamanho da palavra deve ser entre 4 e 6 letras.`
            ));
            return;
        }

        const words = {
            4: [
                "amor", "bola", "casa", "dado", "fato", "gato", "ilha", "jogo", "lago", "mala",
                "nave", "ovo", "pato", "rato", "sapo", "tatu", "urso", "vaca", "eris",
                "bela", "caos", "deus", "fogo", "hora", "iris", "mesa", "novo", "pele",
                "quem", "rima", "sala", "tema", "vida", "alto", "brio", "coro", "duro",
                "fino", "gelo", "juro", "lira", "muro", "nexo", "pico", "raro", "solo", "trio"
            ],
            5: [
                "amora", "banco", "carta", "dente", "festa", "gente", "hotel", "igreja", "jogar", "livro",
                "mundo", "navio", "olhar", "praia", "quase", "rosto", "saber", "tempo", "viver",
                "água", "brisa", "campo", "chave", "ciclo", "dizer", "firme", "folha", "grito",
                "honra", "ideia", "jovem", "lenda", "lugar", "noite", "ordem", "poder", "preto", "quedo",
                "reino", "ruido", "sabor", "tarde", "unido", "valor", "verde", "vigor", "zumbi",
                "astro", "bicho", "corpo", "dorso", "exato", "falso", "globo", "hábil", "inato",
                "jeito", "lápis", "móvel", "nível", "salto", "sonho", "tigre", "valor", "vento",
                "verso", "zebra", "claro", "fator", "lance"
            ],
            6: [
                "amores", "banhos", "carros", "dentes", "festas", "gentes", "hotéis", "igrejas", "jogais", "livros",
                "mundos", "navios", "olhares", "praias", "quases", "rostos", "saberes", "tempos",
                "acesso", "árvore", "beleza", "cantos", "casais", "chamas", "desejo", "escola",
                "filtro", "futuro", "glória", "jardim", "letras", "luzes", "máxim", "nuvens", "passar", "poesia",
                "rápido", "risada", "sombra", "sonhos", "templo", "toques", "valores", "ventos", "versos", "viagem", 
                "mágica", "mágico", "rápido", "rápida", "sábios", "sábias", "tórax", "tórax", "único", "única",
                "banco", "branco", "cobrar", "dóceis", "fácil", "fáceis", "gírias", "hábito", "hábito", "júnior",
                "lápide", "lápides", "móveis", "público", "pública", "sólido", "sólida", "tímido", "tímida"
            ]
        };

        const wordList = size ? words[size as 4 | 5 | 6] : [...words[4], ...words[5], ...words[6]];
        const chosenWord = wordList[Math.floor(Math.random() * wordList.length)];

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
                        message: `Iniciou uma partida de termo no servidor ${interaction.guildId} (palavra: ${chosenWord})`,
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