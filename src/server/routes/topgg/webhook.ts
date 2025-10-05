import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { env } from "#settings";
import { icon, res } from "#functions";
import { prisma } from "#database";

export default async function topggWebhookRoute(app: FastifyInstance, client: Client<true>) {
    app.register(import("@fastify/formbody"));

    app.post<{ Body: {
        bot: string;
        user: string;
        type: string;
        isWeekend: boolean;
        query: string;
    } }>("/webhook", async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== env.TOPGG_AUTHORIZATION) {
            return reply.status(403).send({ error: "Autorização inválida" });
        }

        const { bot, user, type, isWeekend } = req.body;
        if (!bot || !user || !type) {
            return reply.status(400).send({ error: "Dados do voto inválidos" });
        }

        try {
            const userDiscord = client.users.cache.get(user);
            if (!userDiscord) {
                const fetchedUser = await client.users.fetch(user).catch(() => null);
                if (!fetchedUser) {
                    return reply.status(200).send({ message: "Voto processado, mas usuário não encontrado" });
                }
            }

            const reward = isWeekend ? 100 : 50;
            await prisma.user.upsert({
                where: { id: user },
                create: {
                    id: user,
                    money: reward,
                },
                update: {
                    money: { increment: reward },
                },
            });

            const dmChannel = await userDiscord?.createDM().catch(() => null);
            if (dmChannel) {
                await dmChannel.send(
                    res.fuchsia(
                        `${icon.Eris_happy} | Obrigada por votar em mim no **top.gg**! Como recompensa, você ganhou **${reward}** stx! ${isWeekend ? "(Voto x2! 🎉)" : ""}`,
                    ),
                );
            }

            return reply.status(200).send({ message: "Voto processado com sucesso!" });
        } catch (error) {
            console.error("Erro ao processar recompensa:", error);
            return reply.status(500).send({ error: "Erro interno ao processar voto" });
        }
    });
}