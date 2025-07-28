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
    public turnCount: number = 0;
    public passCount: number = 0;
    private erisNextCard: Cards | null = null;
    private playerNextCard: Cards | null = null;
    public amountAposted: number

    // 0 é o dealer, 1 é a éris fácil, 2 a média, 3 a díficil e 4 a pesadelo
    constructor(humor: Humor | 'Random', difficulty: 0 | 1 | 2 | 3 | 4, amount: number) {
        this.humor = humor === 'Random'
            ? (["angry", "happy", "sad", "neutral", "scared", "surprised", "confused"][Math.floor(Math.random() * 7)] as Humor)
            : humor;
        this.difficulty = difficulty;
        this.erisCards = [];
        this.userCards = [];
        this.remainingCards = [];
        this.amountAposted = amount
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
    private drawCard(player: 'eris' | 'user'): Cards {
        if (this.remainingCards.length === 0) {
            this.setDefaultDeck()
            this.shuffleDeck();
        }

        const nextCardIndex = Math.floor(Math.random() * this.remainingCards.length);
        const card = this.remainingCards.splice(nextCardIndex, 1)[0];

        // Atualiza próxima carta apenas para níveis 3 e 4
        if (player === 'eris' && this.difficulty >= 3 && this.remainingCards.length > 0) {
            const futureCardIndex = Math.floor(Math.random() * this.remainingCards.length);
            this.erisNextCard = this.remainingCards[futureCardIndex];
        } else if (player === 'eris') {
            this.erisNextCard = null; // Limpa para níveis 0-2
        }

        return card;
    }

    private shuffleDeck(): void {
        for (let i = this.remainingCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.remainingCards[i], this.remainingCards[j]] = [this.remainingCards[j], this.remainingCards[i]];
        }
    }

    // começar o jogo
    public startGame(): void {
        this.setDefaultDeck();

        do {
            this.userCards = [this.drawCard('user')];
            if (this.difficulty === 0) this.userCards.push(this.drawCard('user'))
        } while (this.calculateHandValue(this.userCards) === 21);

        do {
            this.erisCards = [this.drawCard('eris')];
            if (this.difficulty === 0) this.erisCards.push(this.drawCard('eris'))
        } while (this.calculateHandValue(this.erisCards) === 21);
    }


    // jogada do usuário
    public userTurn(): Cards | null {
        const card = this.drawCard('user')
        this.userCards.push(card);
        if (this.calculateHandValue(this.userCards) > 21) {
            return null;
        }
        return card;
        // se retornar boolean o usuário perdeu, se não ele continua
    }

    // jogada da Éris
    public erisTurn(): Cards | null {
        const card = this.drawCard('eris')
        this.erisCards.push(card);
        if (this.calculateHandValue(this.erisCards) > 21) {
            return null;
        }
        return card;
        // se retornar boolean a Éris perdeu, se não ela continua
    }

    public userStops(): 'eris' | 'user' | 'draw' {
        const erisHand = this.calculateHandValue(this.erisCards);
        const userHand = this.calculateHandValue(this.userCards);

        return userHand === erisHand
            ? 'draw'
            : userHand > erisHand
                ? 'user'
                : 'eris';
    }

    public decideErisAction(playerVisibleCardValue: number): boolean {
        const erisHand = this.calculateHandValue(this.erisCards);

        // Nível 0: Dealer padrão
        if (this.difficulty === 0) {
            const hasSoft17 = this.erisCards.some(card => card.name === 'A') && erisHand === 17;
            return erisHand <= 17 && !hasSoft17; // Para em soft 17
        }

        let chance = 0.7; // Base inicial para pedir carta

        // Níveis 1 e 2: Estratégia com aleatoriedade
        if (this.difficulty <= 2) {
            if (erisHand > 17) chance -= 0.4;
            if (erisHand > 19) chance -= 0.3;
            if (playerVisibleCardValue >= 10) chance += 0.2; // Jogador tem carta alta
            if (playerVisibleCardValue <= 6) chance -= 0.2;  // Jogador tem carta baixa
            if (this.difficulty === 2) {
                // Análise leve do baralho restante
                const highCardRatio = this.calculateHighCardRatio();
                chance += highCardRatio > 0.5 ? 0.1 : -0.1; // Mais agressivo se há mais cartas altas
            }
            chance += this.getHumorModifier(); // Limitado a ±0.2
            chance = Math.min(Math.max(chance, 0), 1);
            return Math.random() < chance;
        }
        // Nível 3: Difícil
        else if (this.difficulty === 3) {
            if (this.erisNextCard && Math.random() < 0.6) {
                const erisHandValueNextCard = this.calculateHandValue([...this.erisCards, this.erisNextCard]);
                if (erisHandValueNextCard <= 21) return true;
                if (erisHandValueNextCard > 21 && erisHand >= 16) return false; // Evita estourar
            }
            // Estratégia baseada na carta do jogador
            if (erisHand > 17) chance -= 0.4;
            if (erisHand > 19) chance -= 0.3;
            if (playerVisibleCardValue >= 10 && this.userCards.length > 2) chance -= 0.2; // Jogador pode estourar
            if (playerVisibleCardValue <= 6) chance -= 0.3; // Jogador tem mão fraca
            const highCardRatio = this.calculateHighCardRatio();
            chance += highCardRatio > 0.5 ? 0.2 : -0.2;
            chance += this.getHumorModifier();
            chance = Math.min(Math.max(chance, 0), 1);
            return Math.random() < chance;
        }
        // Nível 4: Pesadelo
        else {
            if (this.erisNextCard) {
                const erisHandValueNextCard = this.calculateHandValue([...this.erisCards, this.erisNextCard]);
                const highCardRatio = this.calculateHighCardRatio();
                // Decisão otimizada
                if (erisHandValueNextCard <= 21 && erisHand < 19) return true; // Pede carta se seguro e mão não é forte
                if (erisHand >= 19) return false; // Para em mãos fortes
                if (playerVisibleCardValue >= 10 && this.userCards.length > 3) return false; // Jogador provavelmente estourará
                if (highCardRatio > 0.6 && erisHand >= 16) return false; // Evita risco com muitas cartas altas
                return Math.random() < 0.95; // 5% de chance de "errar"
            }
            return erisHand <= 17; // Fallback
        }
    }

    private calculateHighCardRatio(): number {
        const highCards = this.remainingCards.filter(card =>
            ['10', 'J', 'Q', 'K', 'A'].includes(card.name)).length;
        return highCards / (this.remainingCards.length || 1);
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
    const games = (cache.get("blackjackGames") as Record<string, BlackjackIA>) || {};
    games[id] = game;
    cache.set("blackjackGames", games);
};

// Remove jogo de um usuário (por exemplo, após fim do jogo)
export const removeBlackjackGame = (id: string) => {
    const games = getBlackjackGames();
    delete games[id];
    cache.set("blackjackGames", games);
};