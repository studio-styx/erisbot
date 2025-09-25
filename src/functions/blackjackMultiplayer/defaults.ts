import { Store } from "#base";
import { Cards } from "#functions";
import { BlackjackMultiplayerGame } from "#types/blackjackMultiplayerGame.js";

export function setDefaultDeck() {
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

    return fullDeck;
}

export function calculateHandValue(hand: Cards[]): number {
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
export function drawCard(remaningCards: Cards[]) {
    const index = Math.floor(Math.random() * remaningCards.length);
    const card = remaningCards[index];
    remaningCards.splice(index, 1);
    return {
        card,
        remaningCards
    };
}

// começar o jogo
export function smufleCards() {
    let userCards: Cards[] = [];
    let targetCards: Cards[] = [];
    let remaningCards = setDefaultDeck();
    do {
        const result = drawCard(remaningCards);
        remaningCards = result.remaningCards;
        userCards = [result.card];
    } while (calculateHandValue(userCards) === 21);

    do {
        const result = drawCard(remaningCards);
        remaningCards = result.remaningCards;
        targetCards= [result.card];
    } while (calculateHandValue(targetCards) === 21);

    return { userCards, targetCards, remaningCards };
}

const blackjackGames = new Store<BlackjackMultiplayerGame>();

export function setBlackjackGameMultiplayer(msgId: string, game: BlackjackMultiplayerGame) {
    blackjackGames.set(msgId, game, {
        time: 1000 * 60 * 30
    });
}

export function getBlackjackGameMultiplayer(msgId: string) {
    return blackjackGames.get(msgId);
}

export function deleteBlackjackGameMultiplayer(msgId: string) {
    return blackjackGames.delete(msgId);
}