import { Store } from "#base";
import { LorittaApiSDKUserInfo } from "#types/lorittaApiUserInfoResponse.js";
import axios from "axios";

const store = new Store<LorittaApiSDKUserInfo>()

export class LorittaApiSDK {
    private apiKey: string;
    private baseUrl = "https://api.loritta.website/v1";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    public async user(userId: string): Promise<LorittaApiSDKUserInfo> {
        const cachedUser = store.get(userId);

        if (cachedUser) {
            return cachedUser;
        }

        const response = await axios.get(`${this.baseUrl}/users/${userId}`, {
            headers: {
                Authorization: this.apiKey
            }
        });

        const data = response.data as LorittaApiSDKUserInfo;

        const formattedData = {
            ...data,
            lorittaBanState: data.lorittaBanState ? {
                ...data.lorittaBanState,
                bannedAt: new Date(data.lorittaBanState.bannedAt),
                expiresAt: data.lorittaBanState.expiresAt ? new Date(data.lorittaBanState.expiresAt) : null
            } : null,
        }

        store.set(userId, formattedData, { time: 1000 * 60 * 15 })

        return formattedData
    }
}