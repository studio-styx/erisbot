import { FetchResult } from "#settings";
import axios from "axios";
import { RESTPostOAuth2AccessTokenResult, RouteBases } from "discord.js";
import { StatusCodes } from "http-status-codes";

type TokenExchangeResult = FetchResult<RESTPostOAuth2AccessTokenResult>;


export async function userAcessToken(code: string): Promise<TokenExchangeResult>
export async function userAcessToken(refreshToken: string, refresh: true): Promise<TokenExchangeResult>
export async function userAcessToken(argA: string, refresh: boolean = false): Promise<TokenExchangeResult> {
    const clientInfo = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
    }

    const fetchBody = refresh
    ? {
        grant_type: "refresh_token",
        refresh_token: argA
        }
    : {
        grant_type: "authorization_code",
        code: argA,
        redirect_uri: `${process.env.SERVER_BASE_URL}/auth/redirect`
    }

    const body: {} = Object.assign(clientInfo, fetchBody);

    const response = await axios.post(`${RouteBases.api}/oauth2/token`, body, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: new URLSearchParams(body).toString()
    });

    const data = response.data as RESTPostOAuth2AccessTokenResult;

    if (response.status !== StatusCodes.OK) {
        return {
            success: false,
            error: response.statusText,
            status: response.status
        };
    }
    return { success: true, data };
}