import type { Client } from "discord.js";
import type { FastifyInstance } from "fastify";
import { homeRoute } from "./home.js";
import { economyRoute } from "./economy/economyRoute.js";

export function registerRoutes(app: FastifyInstance, client: Client<true>) {
    homeRoute(app, client)
    economyRoute(app, client)
}