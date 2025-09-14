export interface GiveawayManageDataInfo {
    id?: number;
    title?: string;
    description?: string;
    expiresAt?: Date;
    roleEntries?: { roleName: string; roleId: string; entries: number }[];
    channelId?: string;
    blackListRoles?: string[];
    xpRequired?: number;
    connectedGuilds?: { guildName: string; guildId: string, accepted: boolean }[];
    winners?: number;
    stayInServerRequire?: boolean;
}