import { redis } from "#database";
import { PetElement, UserPetPower } from "#prisma";
import { NormalizePetPowerReturns } from "./getPetPowerDetails.js";

type PetStats = {
    powers: (UserPetPower & NormalizePetPowerReturns)[];
    life: number;
    mana: number;
    name: string
}

interface BaseBattleEffects {
    startedRoud: number;
    durationRounds: number;
    effected: "PET1" | "PET2";
}

interface BattleEffectDamage {
    type: "DAMAGE",
    stats: {
        damage: number;
        lessEffect?: number; // Se perde efeito ao longo do tempo
    }
}

interface BattleEffectHeal {
    type: "HEAL",
    stats: {
        heal: number;
    }
}

interface BattleEffectBuff {
    type: "BUFF",
    stats: {
        amount: number;
        elementBuffed: PetElement;
        effectAll: boolean;
    }
}

interface BattleEffectDebuff {
    type: "DEBUFF",
    stats: {
        amount: number;
        elementDebuffed: PetElement;
        effectAll: boolean;
    }
}

export type BattleEffects = BaseBattleEffects & (
    | BattleEffectDamage
    | BattleEffectHeal
    | BattleEffectBuff
    | BattleEffectDebuff
);


export interface CachedPetBattle {
    id: number;
    pet1Id: number;
    pet2Id: number;
    user1Id: string;
    user2Id: string;
    amount: number | null;
    round: number;
    turn: "PET1" | "PET2";
    pet1: PetStats;
    pet2: PetStats;
    effects: BattleEffects[]
}


export const battleManage = {
    setPetBattle,
    getPetBattle,
    deletePetBattle
}

async function setPetBattle(battle: CachedPetBattle) {
    await redis.setex(`petBattle:${battle.id}`, 60 * 10, JSON.stringify(battle))
}

async function getPetBattle(id: number) {
    const battle = await redis.get(`petBattle:${id}`);
    if (!battle) return null;
    return JSON.parse(battle) as CachedPetBattle;
}

async function deletePetBattle(id: number) {
    await redis.del(`petBattle:${id}`);
}
