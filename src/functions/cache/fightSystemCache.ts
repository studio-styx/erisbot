import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 1200 }); // 20 minutos de TTL

export interface FightWait {
    userId: string;
    guildId: string;
    createdAt: Date;
}

export interface AcceptFight {
    user1: boolean;
    user2: boolean;
    startedAt: Date;
    message1Url: string;
    message2Url: string;
}

export function getFightWait(): FightWait[] {
    return cache.get<FightWait[]>(`waitFight`) || [];
}

export function addFightWait(userId: string, guildId: string): void {
    const waitFight = getFightWait();
    waitFight.push({ userId, guildId, createdAt: new Date() });
    cache.set<FightWait[]>(`waitFight`, waitFight);
}

export function usersBatlleSet(user1: string, user2: string): void {
    const waitFight = getFightWait();
    const updatedWait = waitFight.filter(wait => 
        wait.userId !== user1 && wait.userId !== user2
    );
    cache.set<FightWait[]>(`waitFight`, updatedWait);
}

export function setFightWait(waitFight: FightWait[]): void {
    cache.set<FightWait[]>(`waitFight`, waitFight);
}

export function acceptFight(user1: string, user2: string, message1Url: string, message2Url: string) {
    return cache.set<AcceptFight>(`acceptFight:${user1}:${user2}`, {
        user1: false,
        user2: false,
        startedAt: new Date(),
        message1Url,
        message2Url
    });
}

export function getAcceptFight(user1: string, user2: string): AcceptFight | undefined {
    return cache.get<AcceptFight>(`acceptFight:${user1}:${user2}`) || 
           cache.get<AcceptFight>(`acceptFight:${user2}:${user1}`);
}

export function updateAcceptFight(user1: string, user2: string, data: AcceptFight): void {
    cache.set<AcceptFight>(`acceptFight:${user1}:${user2}`, data);
}

export function removeAcceptFight(user1: string, user2: string): void {
    cache.del(`acceptFight:${user1}:${user2}`);
    cache.del(`acceptFight:${user2}:${user1}`);
}