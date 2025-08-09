import { FetchResult } from "#settings";
import axios from "axios";
import { APIUser, RouteBases } from "discord.js";

type FetchUserInfoResult = FetchResult<APIUser>;

export async function fetchUserInfo(accessToken: string): Promise<FetchUserInfoResult> {
    const response = await axios.get(`${RouteBases.api}/users/@me`, {
        headers: {
            authorization: `Bearer ${accessToken}`
        }
    })
    
    if (response.status !== 200) {
        return {
            success: false,
            error: response.statusText,
            status: response.status
        }
    }

    const data = await response.data as APIUser;
    return { success: true, data };
}