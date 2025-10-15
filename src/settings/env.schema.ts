import { z } from "zod";

export const envSchema = z.object({
    BOT_TOKEN: z.string("Discord Bot Token is required").min(1),
    WEBHOOK_LOGS_URL: z.url().optional(),
    SERVER_PORT: z.coerce.number().min(1).optional(),
    DEVELOPMENT: z.coerce.boolean().optional(),
    GEMINI_API_KEY: z.string("Gemini API Key is required").min(1),
    GEMINI_CHATBOT_API_KEY: z.string("Gemini Chatbot API Key is required").min(1),
    DATABASE_URL: z.string("Database URL is required").min(1),
    AS_DATABASE_URL: z.string("AS Database URL is required").min(1),
    DEVZONE_DATABASE_URL: z.string("Devzone Database URL is required").min(1),
    DEV_DATABASE_URL: z.string("Dev Database URL is required").min(1),
    DEV_AS_DATABASE_URL: z.string("Dev AS Database URL is required").min(1),
    REDIS_URL: z.string("Redis URL is required").min(1),
    COOKIE_SECRET: z.string("Cookie Secret is required").min(1),
    JWT_SECRET: z.string("JWT Secret is required").min(1),
    FRONT_SECRET: z.string("Front Secret is required").min(1),
    RECAPTCHA_SECRET_KEY: z.string("Recaptcha Secret Key is required").min(1),
    FRONT_BASE_URL: z.string("Front Base URL is required").min(1),
    SERVER_BASE_URL: z.string("Server Base URL is required").min(1),
    CLIENT_ID: z.string("Client ID is required").min(1),
    CLIENT_SECRET: z.string("Client Secret is required").min(1),
    WEBHOOK_TRYVIA_PIPELINE_URL: z.string("Webhook Tryvia Pipeline URL is required").min(1),
    TOPGG_API_TOKEN: z.string("Topgg API Token is required").min(1),
    TOPGG_AUTHORIZATION: z.string("Topgg Authorization is required").min(1),
    LORITTA_API_KEY: z.string("Loritta api keys is required").min(1)
});
