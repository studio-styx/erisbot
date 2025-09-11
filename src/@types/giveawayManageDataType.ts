export interface GiveawayManageDataInfo {
    title?: string;
    description?: string;
    expiresAt?: Date;
    roleEntries?: { roleName: string; roleId: string; entries: number }[];
    channelId?: string;
    blackListRoles?: string[];
    xpRequired?: number;
    connectedGuilds?: string[];
    winners?: number
}