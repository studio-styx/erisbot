type PowerType = "offensive" | "defensive";
type PowerTags = "launch" | "shield" | "heal" | "damage" | "area" | "buff" | "debuff" | "trap";

export interface PowerStats {
    [key: string]: Element
}

export interface Element {
    powers: Power[];
}

export interface Power {
    name: string;
    description: string;
    damage?: number;
    damageReduction?: number;
    cooldown: number;
    manaCost: number;
    type: PowerType;
    tags: PowerTags[];
    area?: number; // For area of effect powers
    duration?: number; // For powers with a duration
}

export const powerStats: PowerStats = {
    fire: {
        powers: [
            {
                name: "Fireball",
                description: "Launches a fiery projectile that explodes on impact, dealing damage to enemies in a small area.",
                damage: 50,
                cooldown: 5,
                manaCost: 20,
                type: "offensive",
                tags: ["launch", "damage", "area"],
                area: 3
            },
            {
                name: "Flame Shield",
                description: "Creates a protective shield of flames that reduces incoming damage for a short duration.",
                damageReduction: 30,
                duration: 2,
                cooldown: 15,
                manaCost: 25,
                type: "defensive",
                tags: ["shield"]
            },
            {
                name: "Firestorm",
                description: "Calls down a fiery storm that deals damage to all enemies in an area.",
                damage: 80,
                area: 5,
                cooldown: 30,
                manaCost: 30,
                type: "offensive",
                tags: ["launch", "damage", "area"]
            },
            {
                name: "Blaze Trap",
                description: "Sets a fiery trap on the ground that ignites when enemies step on it, dealing damage over time.",
                damage: 20,
                duration: 2,
                cooldown: 20,
                manaCost: 15,
                type: "offensive",
                tags: ["trap", "damage", "area"],
                area: 2
            }
        ]
    },
    water: {
        powers: [
            {
                name: "Tidal Wave",
                description: "Summons a massive wave that pushes enemies back and deals damage in a wide area.",
                damage: 60,
                area: 6,
                cooldown: 25,
                manaCost: 25,
                type: "offensive",
                tags: ["launch", "damage", "area"]
            },
            {
                name: "Healing Mist",
                description: "Creates a soothing mist that heals allies over time within a small area.",
                duration: 3,
                cooldown: 18,
                manaCost: 20,
                type: "defensive",
                tags: ["heal", "area"],
                area: 4
            },
            {
                name: "Aqua Barrier",
                description: "Forms a protective water barrier that reduces incoming damage for a short duration.",
                damageReduction: 25,
                duration: 8,
                cooldown: 12,
                manaCost: 20,
                type: "defensive",
                tags: ["shield"]
            }
        ]
    },
    earth: {
        powers: [
            {
                name: "Stone Spike",
                description: "Raises sharp stone spikes from the ground to impale a single enemy.",
                damage: 55,
                cooldown: 6,
                manaCost: 18,
                type: "offensive",
                tags: ["launch", "damage"]
            },
            {
                name: "Earth Wall",
                description: "Erects a sturdy wall of earth that blocks incoming attacks for a short duration.",
                damageReduction: 40,
                duration: 3,
                cooldown: 20,
                manaCost: 25,
                type: "defensive",
                tags: ["shield"]
            },
            {
                name: "Quicksand Trap",
                description: "Creates a patch of quicksand that slows and damages enemies over time.",
                damage: 15,
                duration: 3,
                cooldown: 22,
                manaCost: 20,
                type: "offensive",
                tags: ["trap", "debuff", "area"],
                area: 3
            }
        ]
    },
    air: {
        powers: [
            {
                name: "Wind Slash",
                description: "Unleashes a sharp gust of wind that cuts through enemies in a line.",
                damage: 45,
                area: 4,
                cooldown: 8,
                manaCost: 15,
                type: "offensive",
                tags: ["launch", "damage", "area"]
            },
            {
                name: "Zephyr Shield",
                description: "Surrounds the caster with swirling winds that deflect incoming attacks.",
                damageReduction: 20,
                duration: 2,
                cooldown: 12,
                manaCost: 18,
                type: "defensive",
                tags: ["shield"]
            },
            {
                name: "Gale Burst",
                description: "Releases a powerful burst of wind that pushes enemies back and deals minor damage.",
                damage: 25,
                area: 5,
                cooldown: 15,
                manaCost: 20,
                type: "offensive",
                tags: ["launch", "damage", "area"]
            }
        ]
    }
}

export const getElement = (element: string): Element | undefined => {
    return powerStats[element];
}

export const getPower = (element: string, powerName: string): Power | undefined => {
    const elementData = getElement(element);
    return elementData?.powers.find(power => power.name === powerName);
}

export const getPowerWithoutElement = (powerName: string): Power | undefined => {
    for (const element in powerStats) {
        const power = getPower(element, powerName);
        if (power) {
            return power;
        }
    }
    return undefined
}

export const getAllPowers = (element: string): Power[] | undefined => {
    const elementData = getElement(element);
    return elementData?.powers;
}