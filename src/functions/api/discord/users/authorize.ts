import { OAuth2Scopes } from "discord.js";

export function createAuthorizationURL(...scopes: OAuth2Scopes[]) {
    const url = new URL("https://discord.com/oauth2/authorize");

    if (!scopes.includes(OAuth2Scopes.Identify)) {
        scopes.push(OAuth2Scopes.Identify);
    }

    url.search = new URLSearchParams({
        client_id: process.env.CLIENT_ID!,
        redirect_uri: `${process.env.SERVER_BASE_URL}/auth/redirect`,
        response_type: "code",
        scope: scopes.flat().join(" ")
    }).toString();

    return url.toString();
}