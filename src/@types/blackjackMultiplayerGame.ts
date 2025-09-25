import { Cards } from "#functions";
import { ButtonInteraction, UserSelectMenuInteraction } from "discord.js";

export interface BlackjackMultiplayerGame {
    userId: string;
    targetId: string;
    amount: number;
    userHand: Cards[];
    targetHand: Cards[];
    turn: "user" | "target";
    wins: "user" | "target" | "draw" | null;
    channelId: string;
    guildId: string;
    messageId: string;
    passCount: number;
    rounds: number;
    remaningCards: Cards[];
    userInteraction: ButtonInteraction<"cached"> | UserSelectMenuInteraction<"cached">;
    targetInteraction: ButtonInteraction<"cached"> | UserSelectMenuInteraction<"cached">;
}