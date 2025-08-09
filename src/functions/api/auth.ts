import { prisma } from "#database";
import { RESTPostOAuth2AccessTokenResult } from "discord.js";
import { API } from "./index.js";

export async function setAuth(userId: string, tokenData: RESTPostOAuth2AccessTokenResult) {
    const expiresAt = new Date();
    expiresAt.setSeconds(
        expiresAt.getSeconds() + tokenData.expires_in
    );

    return await prisma.user.upsert({
        where: {
            id: userId
        },
        create: {
            id: userId,
            token: {
                access: tokenData.access_token,
                refresh: tokenData.refresh_token,
                type: tokenData.token_type,
                expiresAt
            }
        },
        update: {
            token: {
                access: tokenData.access_token,
                refresh: tokenData.refresh_token,
                type: tokenData.token_type,
                expiresAt
            }
        }
    })
}

export async function getAccessToken(userId: string, refresh?: boolean | undefined) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            token: true
        }
    });

    
    if (!user || !user.token) return null;

    const token = user.token as { access: string; refresh: string; type: string; expiresAt: string };
    
    if (refresh) {
        const result = await API.discord.users.tokenExchange(token.refresh);
        if (!result.success) return null;
        await setAuth(userId, result.data);
        return getAccessToken(userId);
    }

    return token.access;
}