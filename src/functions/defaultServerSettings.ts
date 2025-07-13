import { ServerSettings } from "./cache/serverSettingsCache.js";

export const defaultServerSettings: ServerSettings = {
    chatBotChannels: [],
    chatBotEnabled: false,
    channelsCommandDisabled: [],
    channelsCommandEnabled: [],
    channelsCommandDisabledIsHabilited: false,
    channelsCommandEnabledIsHabilited: false,
}