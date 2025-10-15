import { Store } from "#base";
import { UserPet, UserFish, UserGiveaway, User } from "#prisma";
import { LorittaApiSDKUserInfo } from "#types/lorittaApiUserInfoResponse.js";

type ExpectedValue = {
    erisUser: User & {
        activePet: UserPet | null; 
        pets: UserPet[];
        fishs: UserFish[]; 
        giveaways: UserGiveaway[]
    };
    lorittaUser: LorittaApiSDKUserInfo | null
}

const store = new Store<ExpectedValue>();

export function setUserInfo(userId: string, data: ExpectedValue) {
    store.set(userId, data, { time: 1000 * 60 * 15 });
}

export function getUserInfo(userId: string) {
    return store.get(userId);
}

export function removeUserInfo(userId: string) {
    store.delete(userId);
}