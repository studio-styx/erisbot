export interface LorittaApiUserInfoResponse {
    id: string;
    xp: number;
    sonhos: number;
    aboutMe: string | null;
    gender: "UNKNOWN" | "MALE" | "FEMALE";
    emojiFightEmoji: string | null;
    lorittaBanState: {
        bannedAt: string;
        expiresAt: string | null;
        reason: string;
    } | null,
    features: {
        thirdPartySonhosTransferTax: 0.1
    } & Record<any, any>;
}

export interface LorittaApiSDKUserInfo {
    id: string;
    xp: number;
    sonhos: number;
    aboutMe: string | null;
    gender: "MALE" | "FEMALE" | undefined;
    emojiFightEmoji: string | null;
    lorittaBanState: {
        bannedAt: Date;
        expiresAt: Date | null;
        reason: string;
    } | null;
    features: {
        thirdPartySonhosTransferTax: 0.1
    } & Record<any, any>;
}