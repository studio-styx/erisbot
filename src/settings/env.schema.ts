import { z } from "zod";

export const envSchema = z.object({
    BOT_TOKEN: z.string().min(1, { message: "Discord Bot Token is required" }),
    WEBHOOK_LOGS_URL: z.string().url().optional(),
    GEMINI_API_KEY: z.string()
});