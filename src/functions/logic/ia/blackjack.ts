import { getRandomValue, icon } from "#functions";
import NodeCache from "node-cache";

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

export const getAllUserBlackjackGames = (): BlackjackGamesHistory[] => {
    const games = cache.get("userBlackjackGames") as BlackjackGamesHistory[] || [];
    return games;
}

export const userGames = (id: string): BlackjackGamesHistory[] => {
    return getAllUserBlackjackGames().filter(g => g.userId === id);
}

export const addUserGame = (game: BlackjackGamesHistory) => {
    const games = getAllUserBlackjackGames();
    games.push(game);
    cache.set("userBlackjackGames", games);
}

export type Humor = "angry" | "happy" | "sad" | "neutral" | "scared" | "surprised" | "confused";

export interface Cards {
    number: number;
    name: string;
}

export interface ActionResult {
    action: 'hit' | 'stand';
    card?: Cards;
}

export interface BlackjackGamesHistory {
    userId: string;
    winner: "eris" | "user" | "draw";
    reason: "bigHand" | "over21";
    amount: number;
    difficulty: 0 | 1 | 2 | 3 | 4;
    humor: Humor
    timestamp: number;
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

    public getErisNextCard(): Cards | null {
        return this.erisNextCard;
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
    public erisTurn(predefinedCard?: Cards): Cards | null {
        if (predefinedCard) {
            this.erisCards.push(predefinedCard);
            if (this.calculateHandValue(this.erisCards) > 21) {
                return null;
            }
            return predefinedCard;
        }
        const card = this.drawCard('eris')
        this.erisCards.push(card);
        if (this.calculateHandValue(this.erisCards) > 21) {
            return null;
        }
        return card;
        // se retornar null a Éris perdeu, se não ela continua
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

    public decideErisAction(playerVisibleCardValue: number): ActionResult {
        const erisHand = this.calculateHandValue(this.erisCards);
        const isSoftHand = this.erisCards.some(card => card.name === 'A') && erisHand <= 18;

        // Função auxiliar para escolher uma carta
        const chooseCard = (minValue: number, maxValue: number, chanceOfError: number): Cards => {
            const validCards = this.remainingCards.filter(card => card.number >= minValue && card.number <= maxValue);
            const targetCards = chanceOfError > Math.random() ? this.remainingCards : validCards;
            return getRandomValue(targetCards.length ? targetCards : this.remainingCards);
        };

        // Dificuldade 0: Dealer padrão
        if (this.difficulty === 0) {
            return erisHand < 17 || (erisHand === 17 && isSoftHand)
                ? { action: 'hit' }
                : { action: 'stand' };
        }

        // Calcular probabilidade base para pedir carta
        let chance = 0.6; // Reduzido de 0.7 para menos agressividade

        if (this.difficulty === 1) {
            // Eris Fácil: Decisão simples com base em probabilidade
            if (erisHand > 17) chance -= 0.4;
            if (erisHand > 19) chance -= 0.3;
            chance += this.getHumorModifier();
            chance = Math.min(Math.max(chance, 0), 1);
            return Math.random() < chance ? { action: 'hit' } : { action: 'stand' };
        } else if (this.difficulty === 2) {
            // Eris Normal: Mais cautelosa, considera risco de estouro
            if (erisHand > 17) chance -= 0.4; // Mais cauteloso que antes (era 0.3)
            if (erisHand > 19) chance -= 0.28;
            if (playerVisibleCardValue >= 10) chance += 0.17; // Reduzido de 0.2
            if (playerVisibleCardValue <= 6) chance += 0.17; // Reduzido de 0.2
            if (isSoftHand && erisHand <= 17) chance += 0.25; // Mais agressivo em soft hands

            // Calcula risco de estourar
            const bustRisk = this.remainingCards.filter(card => card.number + erisHand > 21).length / this.remainingCards.length;
            if (bustRisk > 0.4 && erisHand >= 15) chance -= 0.15; // Evita estourar em mãos altas
            if (erisHand === 21) chance = 0;
            chance = Math.min(Math.max(chance, 0), 1);

            if (Math.random() > chance) {
                return { action: 'stand' };
            }

            const maxCardValue = 21 - erisHand;
            const card = chooseCard(1, maxCardValue, 0.4);
            return { action: 'hit', card };
        } else if (this.difficulty === 3) {
            // Eris Difícil: Mais estratégica, menor chance de erro
            if (erisHand > 17) chance -= 0.5;
            if (erisHand > 19) chance -= 0.3;
            if (playerVisibleCardValue >= 10) chance += 0.3;
            if (playerVisibleCardValue <= 6) chance -= 0.3;
            if (isSoftHand && erisHand <= 17) chance += 0.2; // Mais agressivo em soft hands

            if (Math.random() > chance) {
                return { action: 'stand' };
            }

            const maxCardValue = 21 - erisHand;
            const card = chooseCard(1, maxCardValue, 0.2); // Menor chance de erro
            return { action: 'hit', card };
        } else if (this.difficulty === 4) {
            // Eris Pesadelo: Altamente estratégica, considera probabilidade de estourar
            if (erisHand > 17) chance -= 0.6;
            if (erisHand > 19) chance -= 0.4;
            if (playerVisibleCardValue >= 10) chance += 0.4;
            if (playerVisibleCardValue <= 6) chance -= 0.4;
            if (isSoftHand && erisHand <= 17) chance += 0.3;

            // Calcula probabilidade de estourar
            const bustRisk = this.remainingCards.filter(card => card.number + erisHand > 21).length / this.remainingCards.length;
            if (bustRisk > 0.5 && erisHand >= 16) chance -= 0.3;

            if (Math.random() > chance) {
                return { action: 'stand' };
            }

            const maxCardValue = 21 - erisHand;
            const card = chooseCard(1, maxCardValue, 0.1); // Mínima chance de erro
            return { action: 'hit', card };
        }

        // Fallback para dificuldades inválidas
        return { action: 'stand' };
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

    public erisComentary(wins?: 'eris' | 'user' | 'push'): string {
        const erisHand = this.calculateHandValue(this.erisCards);
        const userHand = this.calculateHandValue(this.userCards);
        const humorModifier = this.getHumorModifier();

        const isUserBusted = userHand > 21;
        const isErisNearBust = erisHand >= 19 && erisHand < 21;
        const isErisWeakHand = this.erisCards.length >= 3 && erisHand <= 17;
        const shouldBluff = isErisWeakHand && Math.random() < 0.7; // 70% de chance de blefar

        // Comentários para eventos específicos
        const eventFrases: Record<string, string[]> = {
            erisWins: [
                `${icon.Eris_happy} Haha, vitória minha! Melhor sorte na próxima!`,
                `${icon.Eris_kiss_left} Ganhei, e com estilo!`,
                `${icon.Eris_trusting} Sabia que eu era imbatível!`,
                `${icon.Eris_ok} Você tentou, mas eu sou melhor!`,
                `Minha mão arrasou! ${icon.Eris_enchanted}`,
            ],
            erisLoses: [
                `${icon.Eris_cry} Droga, como você conseguiu isso?!`,
                `${icon.Eris_shy_left} Perdi... mas foi por pouco!`,
                `${icon.Eris_Angry} Isso não acaba aqui, humano!`,
                `${icon.Eris_cry_left} Minha mão me traiu...`,
                `Tch, parabéns... por enquanto. ${icon.Eris_thinking}`,
            ],
            push: [
                `${icon.Eris_fair} Empate? Nada mal, né?`,
                `${icon.Eris_ok_left} Ninguém ganha, ninguém perde!`,
                `${icon.Eris_thinking} Empate... que equilíbrio chato!`,
                `${icon.Eris_fair_left} Empatamos, mas eu quase te peguei!`,
                `Hmph, empate. Vamos de novo? ${icon.Eris_trusting_left}`,
            ],
            userBusted: [
                `${icon.Eris_happy} Estourou, hein? Minha vitória!`,
                `${icon.Eris_kiss} Mais de 21? Tô rindo!`,
                `${icon.Eris_ok_left} Você estourou, que pena!`,
                `${icon.Eris_trusting} Estourar é triste, né? Ganhei!`,
                `Tá vendo? Não dá pra competir comigo! ${icon.Eris_happy_left}`,
            ],
            erisNearBust: [
                `${icon.Eris_shy} Tô no limite aqui...`,
                `${icon.Eris_thinking_left} Essas cartas tão perigosas!`,
                `${icon.Eris_cry} Quase estourando, que medo!`,
                `${icon.Eris_shy_left} Minha mão tá pesada...`,
                `Tô na corda bamba com essa mão! ${icon.Eris_thinking}`,
            ],
            erisWeakBluff: [
                `${icon.Eris_trusting} Minha mão tá imbatível, pode desistir!`,
                `${icon.Eris_happy_left} Acho que já tenho 21, hein!`,
                `${icon.Eris_kiss} Essas cartas são puro ouro!`,
                `${icon.Eris_ok} Você não vai querer enfrentar essa mão!`,
                `Tô com uma mão perfeita, cuidado! ${icon.Eris_enchanted_left}`,
            ],
            erisWeakTruth: [
                `${icon.Eris_shy} Essas cartas não tão ajudando...`,
                `${icon.Eris_cry_left} Minha mão tá meio fraca...`,
                `${icon.Eris_thinking} Não sei se isso vai dar certo...`,
                `${icon.Eris_shy_left} Tô com uma mão ruim, né?`,
                `Essas cartas tão me complicando... ${icon.Eris_cry}`,
            ],
        };

        if (wins === 'eris') {
            return eventFrases.erisWins[Math.floor(Math.random() * eventFrases.erisWins.length)];
        }
        if (wins === 'user') {
            return eventFrases.erisLoses[Math.floor(Math.random() * eventFrases.erisLoses.length)];
        }
        if (wins === 'push') {
            return eventFrases.push[Math.floor(Math.random() * eventFrases.push.length)];
        }
        if (isUserBusted) {
            return eventFrases.userBusted[Math.floor(Math.random() * eventFrases.userBusted.length)];
        }
        if (isErisNearBust) {
            return eventFrases.erisNearBust[Math.floor(Math.random() * eventFrases.erisNearBust.length)];
        }
        if (isErisWeakHand) {
            return shouldBluff
                ? eventFrases.erisWeakBluff[Math.floor(Math.random() * eventFrases.erisWeakBluff.length)]
                : eventFrases.erisWeakTruth[Math.floor(Math.random() * eventFrases.erisWeakTruth.length)];
        }

        // Calcula confiança para comentários genéricos
        let polary = 0; // confiança

        // Ajuste para usar carta visível do jogador
        if (this.userCards.length > 0) {
            if (['10', 'J', 'Q', 'K', 'A'].includes(this.userCards[0].name)) {
                polary -= 0.3; // Jogador tem carta alta
            } else if (['2', '3', '4', '5', '6'].includes(this.userCards[0].name)) {
                polary += 0.3; // Jogador tem carta baixa
            }
        }
        if (erisHand > 17) polary -= 0.2;
        if (erisHand > 19) polary -= 0.2;

        polary += humorModifier;

        let sentimento: "confiante" | "neutra" | "insegura";

        if (polary > 0.7) {
            sentimento = "confiante";
        } else if (polary < 0.3) {
            sentimento = "insegura";
        } else {
            sentimento = "neutra";
        }

        // Comentários genéricos baseados em humor e sentimento
        const frases: Record<Humor, Record<typeof sentimento, string[]>> = {
            angry: {
                confiante: [
                    `${icon.Eris_Angry} Minha mão vai te destruir!`,
                    `${icon.Eris_Angry_left} Tô pronta pra te humilhar!`,
                    `Suas cartas não têm chance contra mim!`,
                    `${icon.Eris_ok} Pode vir, eu topo!`,
                    `Essa rodada é minha! ${icon.Eris_Angry}`,
                ],
                neutra: [
                    `Não me subestime.`,
                    `${icon.Eris_thinking_left} Vamos ver o que você faz...`,
                    `${icon.Eris_Angry} Hmph, joga logo!`,
                    `Tô esperando sua jogada. ${icon.Eris_ok_left}`,
                    `Não me faça perder a paciência!`,
                ],
                insegura: [
                    `Tch... essas cartas são um lixo.`,
                    `${icon.Eris_Angry_left} Sua sorte não dura pra sempre!`,
                    `Você tá me irritando com essa sorte! ${icon.Eris_Angry}`,
                    `${icon.Eris_cry} Essas cartas tão contra mim...`,
                    `Vou virar isso, só espera!`,
                ],
            },
            happy: {
                confiante: [
                    `${icon.Eris_enchanted} Tô com uma mão incrível!`,
                    `Essa rodada tá divertida demais! ${icon.Eris_happy}`,
                    `Prepare-se pra perder com estilo! ${icon.Eris_kiss_left}`,
                    `${icon.Eris_trusting} Minhas cartas são perfeitas!`,
                    `Tô amando essa partida! ${icon.Eris_happy_left}`,
                ],
                neutra: [
                    `Vamos ver no que dá~ ${icon.Eris_fair}`,
                    `Hehe, sua vez!`,
                    `${icon.Eris_ok} Tô de olho em você...`,
                    `Essa rodada tá boa, né? ${icon.Eris_happy}`,
                    `Jogando com calma, mas com estilo! ${icon.Eris_kiss}`,
                ],
                insegura: [
                    `Talvez eu não esteja tão bem... ${icon.Eris_shy_left}`,
                    `Hmm... essas cartas são estranhas. ${icon.Eris_thinking}`,
                    `${icon.Eris_cry_left} Ai, será que vou perder?`,
                    `Tô meio preocupada aqui... ${icon.Eris_shy}`,
                    `Minha mão não tá cooperando...`,
                ],
            },
            sad: {
                confiante: [
                    `Pelo menos minhas cartas não são tão ruins... ${icon.Eris_trusting_left}`,
                    `Ainda posso virar isso... ${icon.Eris_ok}`,
                    `${icon.Eris_fair} Tô tentando, tá?`,
                    `Um pouco de esperança nessa mão...`,
                    `Talvez eu consiga algo bom! ${icon.Eris_happy}`,
                ],
                neutra: [
                    `Tanto faz o resultado... ${icon.Eris_cry}`,
                    `...`,
                    `Jogando por jogar, né? ${icon.Eris_shy_left}`,
                    `Vamos acabar logo com isso...`,
                    `Minhas cartas não me animam. ${icon.Eris_cry_left}`,
                ],
                insegura: [
                    `Eu sabia que ia dar errado... ${icon.Eris_cry}`,
                    `Por que sempre eu? ${icon.Eris_shy}`,
                    `${icon.Eris_cry_left} Essas cartas são horríveis...`,
                    `Nada dá certo pra mim...`,
                    `Minha mão é uma tristeza. ${icon.Eris_shy_left}`,
                ],
            },
            neutral: {
                confiante: [
                    `Minha mão tá bem sólida. ${icon.Eris_ok}`,
                    `Tô gostando dessas cartas. ${icon.Eris_trusting}`,
                    `${icon.Eris_fair_left} Vamos ver quem leva essa!`,
                    `Aposta alta? Eu topo! ${icon.Eris_ok_left}`,
                    `Tô pronta pra essa rodada!`,
                ],
                neutra: [
                    `Continuando o jogo... ${icon.Eris_thinking}`,
                    `Hmm...`,
                    `Vamos lá, sua vez. ${icon.Eris_fair}`,
                    `Sem pressa, só jogando... ${icon.Eris_ok}`,
                    `O que você tem aí? ${icon.Eris_thinking_left}`,
                ],
                insegura: [
                    `Isso pode dar ruim... ${icon.Eris_shy}`,
                    `Vamos ver no que dá...`,
                    `Minha mão não tá tão boa. ${icon.Eris_cry}`,
                    `${icon.Eris_thinking} Será que fiz a escolha certa?`,
                    `Tô meio preocupada com essa rodada... ${icon.Eris_shy_left}`,
                ],
            },
            scared: {
                confiante: [
                    `Acho que posso ganhar essa! ${icon.Eris_trusting}`,
                    `Minha mão tá... ok, né? ${icon.Eris_ok_left}`,
                    `${icon.Eris_happy} Ufa, essas cartas são boas!`,
                    `Tô quase lá, só não estraga!`,
                    `Será que é minha sorte? ${icon.Eris_enchanted}`,
                ],
                neutra: [
                    `Ai, ai... ${icon.Eris_shy}`,
                    `Tomara que dê certo... ${icon.Eris_thinking_left}`,
                    `Não sei o que fazer agora... ${icon.Eris_shy_left}`,
                    `Jogando com cuidado... ${icon.Eris_ok}`,
                    `Essas cartas me deixam nervosa!`,
                ],
                insegura: [
                    `${icon.Eris_shy} Tô com medo de perder...`,
                    `Isso não tá indo bem... ${icon.Eris_cry}`,
                    `${icon.Eris_cry_left} Ai, vou estourar, né?`,
                    `Minhas cartas tão me traindo! ${icon.Eris_shy_left}`,
                    `Não gosto nada disso... ${icon.Eris_thinking}`,
                ],
            },
            surprised: {
                confiante: [
                    `Uou! Minha mão tá incrível! ${icon.Eris_enchanted}`,
                    `Caramba, essas cartas são boas?! ${icon.Eris_happy_left}`,
                    `${icon.Eris_ok} Não esperava estar tão bem!`,
                    `Olha só essa mão! Tô chocada! ${icon.Eris_trusting}`,
                    `Quem diria, eu sou boa nisso! ${icon.Eris_kiss}`,
                ],
                neutra: [
                    `Hmm... interessante. ${icon.Eris_thinking}`,
                    `Oh! ${icon.Eris_fair}`,
                    `Que jogada foi essa? ${icon.Eris_ok_left}`,
                    `Tá ficando quente essa partida!`,
                    `Não esperava por isso... ${icon.Eris_thinking_left}`,
                ],
                insegura: [
                    `O quê?! Minhas cartas são essas?! ${icon.Eris_shy}`,
                    `Não entendi, mas... ok. ${icon.Eris_cry}`,
                    `${icon.Eris_shy_left} Isso não era pra acontecer...`,
                    `Minhas cartas tão zoando comigo! ${icon.Eris_cry_left}`,
                    `Ué, e agora? ${icon.Eris_thinking}`,
                ],
            },
            confused: {
                confiante: [
                    `Acho que minha mão é boa, né? ${icon.Eris_trusting}`,
                    `Tô ganhando... acho! ${icon.Eris_ok}`,
                    `${icon.Eris_happy} Será que sou um gênio?`,
                    `Essas cartas tão a meu favor... acho! ${icon.Eris_fair_left}`,
                    `Tô confusa, mas tô na frente! ${icon.Eris_kiss}`,
                ],
                neutra: [
                    `O que tá acontecendo mesmo? ${icon.Eris_thinking}`,
                    `... era minha vez? ${icon.Eris_shy}`,
                    `Tô meio perdida, mas sigo jogando. ${icon.Eris_ok}`,
                    `Essas cartas tão estranhas... ${icon.Eris_thinking_left}`,
                    `Alguém explica esse jogo? ${icon.Eris_fair}`,
                ],
                insegura: [
                    `Isso não faz sentido. ${icon.Eris_cry}`,
                    `${icon.Eris_cry_left} Acho que fiz besteira.`,
                    `Minha mão tá uma bagunça! ${icon.Eris_shy_left}`,
                    `Por que essas cartas, hein? ${icon.Eris_thinking}`,
                    `Tô totalmente confusa agora... ${icon.Eris_cry}`,
                ],
            },
        };

        // Retorna comentário genérico se nenhum evento específico for detectado
        const grupo = frases[this.humor][sentimento];
        return grupo[Math.floor(Math.random() * grupo.length)];
    }

}
