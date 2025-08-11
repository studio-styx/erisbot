import { ServerSettings } from "./cache/serverSettingsCache.js";

export const defaultServerSettings: ServerSettings = {
    chatBotChannels: [],
    chatBotEnabled: false,
    channelsCommandDisabled: [],
    channelsCommandEnabled: [],
    channelsCommandDisabledIsHabilited: false,
    channelsCommandEnabledIsHabilited: false,
    channelsNotWinXp: [],
    channelsXpBonus: [],
    difficulty: 1,
    levelGrant: [],
    rolesNotWinXp: [],
    rolesXpBonus: [],
    xpSystemEnabled: false,
    warnLevelUp: {
        channel: "",
        onlyIfWinSomeReward: false,
        enabled: false,
        message: {
            embed: {
                title: undefined,
                description: undefined,
                color: 0,
                thumbnail: undefined,
                footer: {
                    text: undefined,
                    icon_url: undefined
                },
                image: undefined
            },
            content: undefined
        }
    }
}