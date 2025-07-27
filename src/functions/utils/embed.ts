import { settings } from "#settings";
import { ComponentData, createContainer, createEmbed, EmbedPlusData, isAttachment, withProperties } from "@magicyan/discord";
import { MessageFlags } from "discord.js";

type settingsColors = typeof settings.colors;
type ResFunction = <O>(text: string, options?: O & EmbedPlusData) => Exclude<O, EmbedPlusData>;
type Res = Record<keyof settingsColors, ResFunction>;

export const res: Res = Object.create({}, Object.entries(settings.colors)
    .reduce((obj, [name, color]) => Object.assign(obj, {
        [name]: {
            enumerable: true, writable: false,
            value(description: string, options?: object){
                const data = Object.assign({ color, description }, options);
                const embed = createEmbed(data);

                if (options && "embeds" in options && Array.isArray(options.embeds)){
                    options.embeds.unshift(embed);
                }
                const defaults = { withResponse: true, flags: ["Ephemeral"], embeds: [embed] };
                return Object.assign(defaults, options);
            }
        }
    }), {})
);

type UnusedProps = "content" | "embeds" | "components" | "ephemeral" | "fetchReply";

type ResV2Function = <R>(...components: ComponentData[]) => R & {
    with<R>(options: Partial<Omit<R, UnusedProps>>): R;
};

type ResV2 = Record<keyof typeof settings.colors, ResV2Function>;

export const resv2: ResV2 = Object.entries(settings.colors)
    .reduce((acc, [key, color]) => ({
        ...acc, [key]: function(...components: ComponentData[]){
            const container = createContainer({
                accentColor: color,
                components,
            });
            const files = components.filter(isAttachment);
            const defaults = {
                files,
                flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
                components: [container],
                content: null,
                embeds: []
            };
            const withFunc = (options: object) => {
                if ("flags" in options && Array.isArray(options.flags)){
                    options.flags = Array.from(new Set([
                        MessageFlags.IsComponentsV2, 
                        ...options.flags
                    ]));
                }
                if ("files" in options && Array.isArray(options.files)){
                    options.files = [...files, ...options.files];
                };
                return { ...defaults, ...options };
            }
            return withProperties(defaults, { with: withFunc });
        }
    }), {} as ResV2)