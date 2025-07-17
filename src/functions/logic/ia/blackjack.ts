import { icon } from "#functions";
import NodeCache from "node-cache";

export type Humor = "angry" | "happy" | "sad" | "neutral" | "scared" | "surprised" | "confused";

export interface Cards {
    number: number;
    name: string;
}

export class BlackjackIA {
    private humor: Humor;
    private difficulty: number;
    private erisCards: Cards[];
    private userCards: Cards[];
    private remainingCards: Cards[];
    private passCount: number = 0;

    constructor(humor: Humor, difficulty: number) {
        this.humor = humor;
        this.difficulty = difficulty;
        this.erisCards = [];
        this.userCards = [];
        this.remainingCards = [];
    }

    public getErisHumor(): Humor {
        return this.humor;
    }

    public getErisDifficulty(): number {
        return this.difficulty;
    }

    public getErisCards(): Cards[] {
        return this.erisCards;
    }

    public getUserCards(): Cards[] {
        return this.userCards;
    }

    public getRemainingCards(): Cards[] {
        return this.remainingCards;
    }

    private setDefaultDeck() {
        const fullDeck: Cards[] = [];

        const names = [
            { name: "A", number: 11 }, // O valor 11 por padrão, e ajusta depois se estourar
            { name: "2", number: 2 },
            { name: "3", number: 3 },
            { name: "4", number: 4 },
            { name: "5", number: 5 },
            { name: "6", number: 6 },
            { name: "7", number: 7 },
            { name: "8", number: 8 },
            { name: "9", number: 9 },
            { name: "10", number: 10 },
            { name: "J", number: 10 },
            { name: "Q", number: 10 },
            { name: "K", number: 10 },
        ];

        for (let i = 0; i < 4; i++) { // 4 vezes cada carta
            for (const card of names) {
                fullDeck.push({ name: card.name, number: card.number });
            }
        }

        this.remainingCards = fullDeck;
    }

    public calculateHandValue(hand: Cards[]): number {
        let total = 0;
        let ases = 0;

        for (const card of hand) {
            total += card.number;
            if (card.name === "A") ases++;
        }

        // Se estourar, transformar Ases de 11 em 1
        while (total > 21 && ases > 0) {
            total -= 10; // Subtrai 11 e soma 1, ou seja, subtrai 10
            ases--;
        }

        return total;
    }

    // sortear cartas
    private drawCard(): Cards {
        const index = Math.floor(Math.random() * this.remainingCards.length);
        const card = this.remainingCards.splice(index, 1)[0];
        return card;
    }

    // começar o jogo
    public startGame(): void {
        this.setDefaultDeck();

        do {
            this.userCards = [this.drawCard()];
        } while (this.calculateHandValue(this.userCards) === 21);

        do {
            this.erisCards = [this.drawCard()];
        } while (this.calculateHandValue(this.erisCards) === 21);
    }


    // jogada do usuário
    public userTurn(): Cards | boolean {
        const card = this.drawCard()
        this.userCards.push(card);
        if (this.calculateHandValue(this.userCards) > 21) {
            return false;
        }
        return card;
        // se retornar boolean o usuário perdeu, se não ele continua
    }

    // jogada da Éris
    public erisTurn(): Cards | boolean {
        const card = this.drawCard()
        this.erisCards.push(card);
        if (this.calculateHandValue(this.erisCards) > 21) {
            return false;
        }
        return card;
        // se retornar boolean a Éris perdeu, se não ela continua
    }

    public userStops(): boolean {
        const erisHand = this.calculateHandValue(this.erisCards);
        const userHand = this.calculateHandValue(this.userCards);

        return userHand > erisHand;
        // se retornar true o usuário ganhou, se não ele perdeu
    }

    public decideErisAction(): boolean {
        const erisHand = this.calculateHandValue(this.erisCards);
        const userCards = this.userCards.length;

        let chance = 0;

        // 🟡 Heurísticas básicas
        if (userCards > 3) chance += 0.1;
        if (userCards > 5) chance += 0.15;
        if (erisHand < 12) chance += 0.4; // Mais agressivo em mãos muito baixas
        if (erisHand >= 12 && erisHand <= 16) chance += 0.2; // Incentivo para mãos médias
        if (erisHand > 17) chance -= 0.2;
        if (erisHand > 19) chance -= 0.3;

        // 🔵 Dificuldade influencia risco
        chance += this.difficulty * 0.3; // Aumenta o impacto da dificuldade

        // 🔴 Humor afeta comportamento
        chance += this.getHumorModifier();

        // 🟣 Probabilidade de estourar
        const bustChance = this.calculateBustProbability();
        chance -= bustChance * 0.3; // Reduz o peso do bustChance

        // 🔒 Limita entre 0 e 1
        chance = Math.max(0, Math.min(1, chance));

        console.log(`[Éris IA] Mão: ${erisHand} | Cartas jogador: ${userCards} | Humor: ${this.humor} | Dif: ${this.difficulty} | BustChance: ${(bustChance * 100).toFixed(1)}% | Chance final: ${(chance * 100).toFixed(1)}%`);

        const shouldDraw = Math.random() < chance;
        if (!shouldDraw) {
            this.passCount = (this.passCount || 0) + 1;
            if (this.passCount >= 2) {
                return false; // Força parada após 2 passagens consecutivas
            }
        } else {
            this.passCount = 0;
        }
        return shouldDraw;
    }

    private calculateBustProbability(): number {
        let bustCards = 0;
        const totalCards = this.remainingCards.length;
        if (totalCards === 0) return 1;

        for (const card of this.remainingCards) {
            const newHand = [...this.erisCards, card];
            if (this.calculateHandValue(newHand) > 21) {
                bustCards++;
            }
        }
        return bustCards / totalCards;
    }

    private getHumorModifier(): number {
        switch (this.humor) {
            case "angry": return 0.3;
            case "happy": return 0.1;
            case "sad": return -0.2;
            case "neutral": return 0;
            case "scared": return -0.3;
            case "surprised": return (Math.random() < 0.5 ? -0.1 : 0.1);
            case "confused": return (Math.random() * 0.6) - 0.3; // Aleatório entre -0.3 e +0.3
            default: return 0;
        }
    }

    public erisComentary(): string {
        const erisHand = this.calculateHandValue(this.erisCards);
        const userCards = this.userCards.length;
        const humorModifier = this.getHumorModifier();

        let polary = 0; // confiança

        if (erisHand > 17) polary -= 0.2;
        if (erisHand > 19) polary -= 0.2;
        if (userCards > 3) polary += 0.4;
        if (userCards > 5) polary += 0.4;

        polary += humorModifier;

        let sentimento: "confiante" | "neutra" | "insegura";

        if (polary > 0.7) {
            sentimento = "confiante";
        } else if (polary < 0.3) {
            sentimento = "insegura";
        } else {
            sentimento = "neutra";
        }

        // Comentários baseados em humor e sentimento
        const frases: Record<Humor, Record<typeof sentimento, string[]>> = {
            angry: {
                confiante: [
                    `${icon.Eris_Angry} Eu irei vencer!`,
                    `${icon.Eris_Angry} Eu sou a melhor!`,
                    `Você já era e seu dinheiro será meu!`,
                ],
                neutra: [
                    `Não me subestime.`,
                    `Isso vai ser interessante.`,
                    `${icon.Eris_Angry} Hmph.`,
                ],
                insegura: [
                    `Tch... isso não é nada.`,
                    `${icon.Eris_Angry} Sorte não dura pra sempre.`,
                ],
            },
            happy: {
                confiante: [
                    `${icon.Eris_enchanted} Haha! Eu tô mandando bem!`,
                    `Essa partida tá divertida!`,
                    `Você vai perder pra mim com estilo!`,
                ],
                neutra: [
                    `Vamos ver no que dá~`,
                    `Hehe, sua vez!`,
                ],
                insegura: [
                    `Talvez essa não seja minha vez...`,
                    `Hmm... será que errei?`,
                ],
            },
            sad: {
                confiante: [
                    `Pelo menos algo está dando certo...`,
                    `Eu... ainda posso vencer.`,
                ],
                neutra: [
                    `Tanto faz o resultado...`,
                    `...`,
                ],
                insegura: [
                    `Eu sabia que isso ia acontecer...`,
                    `Nem sei por que tento.`,
                ],
            },
            neutral: {
                confiante: [
                    `Vamos ver quem ganha.`,
                    `Estou indo bem.`,
                ],
                neutra: [
                    `Continuando o jogo...`,
                    `Hmm...`,
                ],
                insegura: [
                    `Isso pode dar ruim.`,
                    `Vamos ver no que dá...`,
                ],
            },
            scared: {
                confiante: [
                    `Talvez eu consiga!`,
                    `Eu... acho que tô indo bem!`,
                ],
                neutra: [
                    `Ai, ai...`,
                    `Tomara que dê certo...`,
                ],
                insegura: [
                    `${icon.Eris_shy} Eu tô com medo de perder...`,
                    `Isso não tá indo bem...`,
                ],
            },
            surprised: {
                confiante: [
                    `Uou! Nem eu esperava essa jogada!`,
                    `Caramba, isso deu certo?!`,
                ],
                neutra: [
                    `Hmm... interessante.`,
                    `Oh!`,
                ],
                insegura: [
                    `O quê?! Como assim?!`,
                    `Não entendi, mas... ok.`,
                ],
            },
            confused: {
                confiante: [
                    `Acho que isso é bom, né?`,
                    `Talvez eu esteja ganhando?`,
                ],
                neutra: [
                    `O que tá acontecendo mesmo?`,
                    `... era minha vez?`,
                ],
                insegura: [
                    `Isso não faz sentido.`,
                    `${icon.Eris_cry} Acho que fiz besteira.`,
                ],
            },
        };

        const grupo = frases[this.humor][sentimento];
        return grupo[Math.floor(Math.random() * grupo.length)];
    }

}

const cache = new NodeCache({ stdTTL: 20 * 60 }); // 20 minutos TTL

// Recupera todos os jogos armazenados
export const getBlackjackGames = (): Record<string, BlackjackIA> => {
    return cache.get("blackjackGames") as Record<string, BlackjackIA> || {};
};

// Pega o jogo de um usuário específico
export const getBlackjackGame = (id: string): BlackjackIA | undefined => {
    const games = getBlackjackGames();
    return games[id];
};

// Salva ou atualiza o jogo de um usuário
export const setBlackjackGame = (id: string, game: BlackjackIA) => {
    const games = getBlackjackGames();
    games[id] = game;
    cache.set("blackjackGames", games);
};

// Remove jogo de um usuário (por exemplo, após fim do jogo)
export const removeBlackjackGame = (id: string) => {
    const games = getBlackjackGames();
    delete games[id];
    cache.set("blackjackGames", games);
};