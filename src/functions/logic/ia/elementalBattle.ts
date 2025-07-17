import { powerStats, PowerStats, Power, getPower } from "#functions";

interface BattleHistory {
    turn: "Eris" | "Player";
    action: Power | null;
    damage: number;
    healthBefore: {
        Eris: number;
        Player: number;
    };
    healthAfter: {
        Eris: number;
        Player: number;
    };
    manaBefore: {
        Eris: number;
        Player: number;
    };
    manaAfter: {
        Eris: number;
        Player: number;
    };
    
}

export class ElementalBattleIA {
    private erisPowers: PowerStats;
    private playerPowers: PowerStats;
    private erisHealth: number;
    private playerHealth: number;
    private erisMana: number;
    private playerMana: number;
    private difficulty: number; // Dificuldade de 1 (fácil) a 5 (difícil)
    private battleHistory: BattleHistory[] = [];

    constructor(playerPowers: PowerStats, difficulty: number = 1) {
        this.erisPowers = {};
        this.playerPowers = playerPowers;
        this.erisHealth = 100;
        this.playerHealth = 100;
        this.erisMana = 100;
        this.playerMana = 100;
        this.difficulty = Math.max(1, Math.min(5, difficulty)); // Garante que a dificuldade esteja entre 1 e 5
    }

    public startBattle() {
        const totalUserManaPowers = Object.values(this.playerPowers).reduce((acc, element) => {
            return acc + element.powers.reduce((sum, power) => sum + power.manaCost, 0);
        }, 0);
        this.erisPowers = this.distributeErisPowers(totalUserManaPowers);
    }

    private distributeErisPowers(targetMana: number): PowerStats {
        const allPowers = Object.values(powerStats).flatMap(element => element.powers);
        const offensivePowers = allPowers.filter(power => power.type === "offensive");
        const defensivePowers = allPowers.filter(power => power.type === "defensive");
        
        const selectedPowers: Power[] = [];
        let currentMana = 0;
        const maxMana = targetMana * 1.1;
        const minMana = targetMana * 0.9;

        const minOffensive = 1;
        const minDefensive = 1;
        let offensiveCount = 0;
        let defensiveCount = 0;

        const shuffle = <T>(array: T[]): T[] => {
            return array.sort(() => Math.random() - 0.5);
        };

        const shuffledOffensive = shuffle([...offensivePowers]);
        const shuffledDefensive = shuffle([...defensivePowers]);

        for (const power of shuffledOffensive) {
            if (offensiveCount < minOffensive && currentMana + power.manaCost <= maxMana) {
                selectedPowers.push(power);
                currentMana += power.manaCost;
                offensiveCount++;
            }
        }

        for (const power of shuffledDefensive) {
            if (defensiveCount < minDefensive && currentMana + power.manaCost <= maxMana) {
                selectedPowers.push(power);
                currentMana += power.manaCost;
                defensiveCount++;
            }
        }

        const remainingPowers = shuffle([...allPowers]);
        for (const power of remainingPowers) {
            if (currentMana + power.manaCost <= maxMana && currentMana < minMana) {
                selectedPowers.push(power);
                currentMana += power.manaCost;
                if (power.type === "offensive") offensiveCount++;
                else defensiveCount++;
            }
        }

        const erisPowers: PowerStats = {};
        const elements = Object.keys(powerStats);

        selectedPowers.forEach(power => {
            const element = elements.find(elem => 
                powerStats[elem].powers.some(p => p.name === power.name)
            );
            if (element) {
                if (!erisPowers[element]) {
                    erisPowers[element] = { powers: [] };
                }
                erisPowers[element].powers.push(power);
            }
        });

        elements.forEach(element => {
            if (!erisPowers[element]) {
                erisPowers[element] = { powers: [] };
            }
        });

        return erisPowers;
    }

    public decideErisAction(): Power | null {
        // Verificar se tem mana suficiente
        const availablePowers = Object.values(this.erisPowers).flatMap(element =>
            element.powers.filter(power => power.manaCost <= this.erisMana)
        );
        if (availablePowers.length === 0) {
            return null; // Não há poderes disponíveis
        }

        // Definir probabilidades base, ajustadas pela dificuldade
        // Dificuldade 1: mais skip, menos ofensivo
        // Dificuldade 5: mais ofensivo, menos skip
        const baseOffensive = 0.2 + (this.difficulty - 1) * 0.05; // 20% (nível 1) a 40% (nível 5)
        const baseDefensive = 0.4; // Constante, já que defesa é situacional
        const baseSkip = 0.4 - (this.difficulty - 1) * 0.05; // 40% (nível 1) a 20% (nível 5)

        let chanceOfOffensive = baseOffensive;
        let chanceOfDefensive = baseDefensive;
        let chanceOfSkip = baseSkip;

        // Ajustar chances com base nas condições, escalando com a dificuldade
        const difficultyMultiplier = this.difficulty / 5; // Escala de 0.2 (nível 1) a 1.0 (nível 5)

        if (this.erisHealth < 30) {
            chanceOfDefensive += 0.3 * difficultyMultiplier; // Mais defesa em níveis altos
            chanceOfOffensive -= 0.1 * difficultyMultiplier;
            chanceOfSkip -= 0.2 * difficultyMultiplier;
        }
        if (this.playerHealth < 30) {
            chanceOfOffensive += 0.3 * difficultyMultiplier; // Mais agressiva em níveis altos
            chanceOfDefensive -= 0.1 * difficultyMultiplier;
            chanceOfSkip -= 0.2 * difficultyMultiplier;
        }
        if (this.erisHealth > 70) {
            chanceOfOffensive += 0.2 * difficultyMultiplier; // Mais agressiva em níveis altos
            chanceOfDefensive -= 0.1 * difficultyMultiplier;
        }
        if (this.erisHealth < 30 && this.playerHealth < 30) {
            chanceOfOffensive += 0.1 * difficultyMultiplier; // Ligeira preferência por ataque
            chanceOfDefensive -= 0.05 * difficultyMultiplier;
            chanceOfSkip -= 0.05 * difficultyMultiplier;
        }
        if (this.playerMana < 30 && this.erisMana > 30) {
            chanceOfOffensive += 0.2 * difficultyMultiplier; // Aproveita mana baixa do jogador
            chanceOfDefensive -= 0.1 * difficultyMultiplier;
            chanceOfSkip -= 0.1 * difficultyMultiplier;
        }
        if (this.playerMana > 70 && this.erisMana < 30) {
            chanceOfDefensive += 0.2 * difficultyMultiplier; // Mais defensiva em níveis altos
            chanceOfOffensive -= 0.1 * difficultyMultiplier;
            chanceOfSkip -= 0.1 * difficultyMultiplier;
        }

        // Garantir que as chances sejam não-negativas
        chanceOfOffensive = Math.max(0, chanceOfOffensive);
        chanceOfDefensive = Math.max(0, chanceOfDefensive);
        chanceOfSkip = Math.max(0, chanceOfSkip);

        // Normalizar as chances para somar 1.0
        const totalChance = chanceOfOffensive + chanceOfDefensive + chanceOfSkip;
        if (totalChance > 0) {
            chanceOfOffensive /= totalChance;
            chanceOfDefensive /= totalChance;
            chanceOfSkip /= totalChance;
        } else {
            // Caso todas as chances sejam 0, usar valores padrão baseados na dificuldade
            chanceOfOffensive = baseOffensive;
            chanceOfDefensive = baseDefensive;
            chanceOfSkip = baseSkip;
            const total = chanceOfOffensive + chanceOfDefensive + chanceOfSkip;
            chanceOfOffensive /= total;
            chanceOfDefensive /= total;
            chanceOfSkip /= total;
        }

        // Escolher a ação com base nas chances
        const random = Math.random();
        let cumulative = 0;

        if (random < (cumulative += chanceOfOffensive)) {
            // Escolher um poder ofensivo aleatoriamente
            const offensivePowers = availablePowers.filter(power => power.type === "offensive");
            if (offensivePowers.length > 0) {
                return offensivePowers[Math.floor(Math.random() * offensivePowers.length)];
            }
        } else if (random < (cumulative += chanceOfDefensive)) {
            // Escolher um poder defensivo aleatoriamente
            const defensivePowers = availablePowers.filter(power => power.type === "defensive");
            if (defensivePowers.length > 0) {
                return defensivePowers[Math.floor(Math.random() * defensivePowers.length)];
            }
        }
        
        // Se não escolher ofensivo ou defensivo, ou se não houver poderes disponíveis, pular
        return null;
    }
    
    private calculateFuture(): { chanceOfDeffensive: number; chanceOfOffensive: number; chanceOfSkip: number } {
        const baseOffensive = 0.2 + (this.difficulty - 1) * 0.05; // 20% (nível 1) a 40% (nível 5)
        const baseDefensive = 0.4; // Constante, já que defesa é situacional
        const baseSkip = 0.4 - (this.difficulty - 1) * 0.05; // 40% (nível 1) a 20% (nível 5)

        const lastsRounds = this.battleHistory.slice(-4).filter(round => !round.action);
        const erisRounds = lastsRounds.filter(round => round.turn === "Eris");
        const playerRounds = lastsRounds.filter(round => round.turn === "Player");

        let chanceOfOffensive = baseOffensive;
        let chanceOfDefensive = baseDefensive;
        let chanceOfSkip = baseSkip;

        for (const round of playerRounds) {
            if (round.action) {
                const power = round.action;
                if (power.type === "offensive" && power.tags.includes("damage") && (power.duration && power.duration > 0)) {
                    // verificar o round que o player usou o poder, e verificar se o poder ainda está ativo
                    const lastRound = this.battleHistory.findIndex(r => r.turn === "Player" && r.action?.name === power.name);
                    
                    if (lastRound && lastRound > power.duration) {
                        // calcular se pode matar a Éris
                        if (power.damage) {
                            const reaminingRounds = lastRound - power.duration;
                            const damagePerRound = power.damage * reaminingRounds;
                            if (this.erisHealth - damagePerRound <= 0) {
                                chanceOfDefensive += 0.3
                            } else if (this.erisHealth - damagePerRound <= 30) {
                                chanceOfDefensive += 0.2;
                            } else {
                                chanceOfDefensive += 0.05;
                                chanceOfOffensive += 0.1;
                            }
                        }
                    }
                }
            }
        }
    }
}