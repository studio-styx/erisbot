import { PetElement, PetPower } from "#prisma";

/** --- Tipos base --- */
interface BasePetPowerDetails {
    name: string;
    id: number;
    description: string;
    element: PetElement;
    createdAt: Date;
    updatedAt: Date;
}

/** --- Tipos específicos de poder --- */
interface PetDamagePowerDetails {
    type: "DAMAGE";
    details: {
        damage: number;
        cooldown: number;
        manaCost: number;
    };
}

interface PetBuffPowerDetails {
    type: "BUFF";
    details: {
        duration: number;
        cooldown: number;
        manaCost: number;
        elementBuffed: PetElement | null;
    };
}

interface PetDebuffPowerDetails {
    type: "DEBUFF";
    details: {
        duration: number;
        cooldown: number;
        manaCost: number;
        elementDebuffed: PetElement | null;
    };
}

interface PetAutoDamageDetails {
    type: "AUTODAMAGE";
    details: {
        cooldown: number;
        manaCost: number;
        damage: number;
        turnsDuration: number;
    };
}

interface PetHealDetails {
    type: "HEAL";
    details: {
        cooldown: number;
        manaCost: number;
        heal: number;
    };
}

interface PetAutoHealDetails {
    type: "AUTOHEAL";
    details: {
        cooldown: number;
        manaCost: number;
        heal: number;
        turnsDuration: number;
    };
}

/** --- União discriminada final --- */
export type NormalizePetPowerReturns =
    BasePetPowerDetails &
    (
        | PetDamagePowerDetails
        | PetBuffPowerDetails
        | PetDebuffPowerDetails
        | PetAutoDamageDetails
        | PetHealDetails
        | PetAutoHealDetails
    );

/** --- Tipo auxiliar para o JSON cru --- */
type RawDetails = Record<string, number | string | null | undefined>;

/** --- Mapeamento de tipos para suas funções de normalização --- */
const detailsMap = {
    DAMAGE: (details: RawDetails) => ({
        damage: Number(details.damage),
        cooldown: Number(details.cooldown),
        manaCost: Number(details.manaCost),
    }),
    BUFF: (details: RawDetails) => ({
        duration: Number(details.duration),
        cooldown: Number(details.cooldown),
        manaCost: Number(details.manaCost),
        elementBuffed: (details.elementBuffed as PetElement) ?? null,
    }),
    DEBUFF: (details: RawDetails) => ({
        duration: Number(details.duration),
        cooldown: Number(details.cooldown),
        manaCost: Number(details.manaCost),
        elementDebuffed: (details.elementDebuffed as PetElement) ?? null,
    }),
    AUTODAMAGE: (details: RawDetails) => ({
        cooldown: Number(details.cooldown),
        manaCost: Number(details.manaCost),
        damage: Number(details.damage),
        turnsDuration: Number(details.turnsDuration),
    }),
    HEAL: (details: RawDetails) => ({
        cooldown: Number(details.cooldown),
        manaCost: Number(details.manaCost),
        heal: Number(details.heal),
    }),
    AUTOHEAL: (details: RawDetails) => ({
        cooldown: Number(details.cooldown),
        manaCost: Number(details.manaCost),
        heal: Number(details.heal),
        turnsDuration: Number(details.turnsDuration),
    }),
};

/** --- Type guard para validar o tipo do poder --- */
type PowerType = keyof typeof detailsMap;

function isPetPowerType(type: any): type is PowerType {
    return type in detailsMap;
}

/** --- Função principal --- */
export function normalizePetPower(power: PetPower): NormalizePetPowerReturns {
    const details = power.details as RawDetails;

    if (!isPetPowerType(power.type)) {
        throw new Error(`Unknown pet power type: ${power.type}`);
    }

    // Base comum
    const base: BasePetPowerDetails = {
        name: power.name,
        id: power.id,
        description: power.description,
        element: power.element as PetElement,
        createdAt: new Date(power.createdAt),
        updatedAt: new Date(power.updatedAt),
    };

    // Normaliza os detalhes conforme o tipo
    const detailsFn = detailsMap[power.type];
    const normalizedDetails = detailsFn(details);

    // Retorna já no formato correto
    return {
        ...base,
        type: power.type,
        details: normalizedDetails,
    } as NormalizePetPowerReturns;
}
