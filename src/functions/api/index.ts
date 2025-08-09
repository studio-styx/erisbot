import { createAuthorizationURL } from "./discord/users/authorize.js";
import { fetchUserInfo } from "./discord/users/info.js";
import { userAcessToken } from "./discord/users/token.js";

export const API = {
    discord: {
        users: {
            tokenExchange: userAcessToken,
            fetchInfo: fetchUserInfo,
            createAuthorizationURL
        }
    }
}