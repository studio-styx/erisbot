import { settings } from "#settings";
import { createContainer, createEmbed, EmbedPlusData } from "@magicyan/discord";

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

type Resv2Function = <O>(text: string, options?: O) => Exclude<O, O>;

type Resv2 = Record<keyof settingsColors, Resv2Function>;


export const resv2: Resv2 = Object.create({}, Object.entries(settings.colors)
    .reduce((obj, [name, color]) => Object.assign(obj, {
        [name]: {
            enumerable: true, writable: false,
            value(description: string, options?: object){
                const data = Object.assign({ color, description }, options);
                const container = createContainer({
                    accentColor: data.color,
                    components: [data.description]
                })

                if (options && "components" in options && Array.isArray(options.components)){
                    options.components.unshift(container);
                }
                const defaults = { withResponse: true, flags: ["Ephemeral", "IsComponentsV2"], components: [container] };
                return Object.assign(defaults, options);
            }
        }
    }), {})
);