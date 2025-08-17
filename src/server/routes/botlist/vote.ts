import { asPrisma, dzonePrisma } from "#database";
import { getJwtToken } from "#functions";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import axios from "axios";

export default function getUserBotsRoute(app: FastifyInstance, client: Client<true>) {
    app.post<{ Params: { server: string, botId: string }, Body: { recaptchaToken: string } }>("/vote/:botId/:server", async (req, reply) => {
        const server = req.params.server;
        const botId = req.params.botId;
        if (!server || (server !== "eris" && server !== "devzone")) return reply.status(400).send({ error: "Invalid server" });
        const token = req.cookies.auth;
        if (!token) return reply.status(401).send({ error: "Not logged in" });
        const userId = getJwtToken(token);
        if (!userId) return reply.status(401).send({ error: "Invalid token" });

        const { recaptchaToken } = req.body; // Destructure recaptchaToken from req.body
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        try {
            const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
                params: { secret: secretKey, response: recaptchaToken }
            });
            if (!response.data.success) {
                return reply.status(400).send({ error: 'Falha na verificação do reCAPTCHA' });
            }

            const application = server === "eris" ? await asPrisma.application.findUnique({
                where: { id: botId },
                include: {
                    analyze: true,
                    votes: true
                }
            }) : await dzonePrisma.application.findUnique({
                where: { id: botId },
                include: {
                    analyze: true,
                    votes: true
                }
            });

            if (!application) return reply.status(404).send({ error: "Application not found" });
            if (!application.analyzeId || !application.analyze?.finishedIn || !application.analyze.approved) return reply.status(400).send({ error: "Application not analyzed" });

            const user = server === "eris" ? await asPrisma.user.findUnique({
                where: { id: userId },
                include: { cooldowns: true }
            }) : await dzonePrisma.user.findUnique({
                where: { id: userId },
                include: { cooldowns: true }
            });

            if (!user) return reply.status(404).send({ error: "User not found in db" });

            const hasCooldown = user.cooldowns.find(c => c.name === "vote" && c.endIn > new Date());

            function getRemainingTime(futureDate: Date): string {
                const now = new Date();
                const timeDifference = futureDate.getTime() - now.getTime();

                if (timeDifference <= 0) {
                    return "O evento já ocorreu";
                }

                const totalSeconds = Math.floor(timeDifference / 1000);
                const totalMinutes = Math.floor(totalSeconds / 60);
                const totalHours = Math.floor(totalMinutes / 60);
                const totalDays = Math.floor(totalHours / 24);

                const remainingSeconds = totalSeconds % 60;
                const remainingMinutes = totalMinutes % 60;
                const remainingHours = totalHours % 24;

                const timeParts: string[] = [];

                if (totalDays > 0) {
                    timeParts.push(`${totalDays} ${totalDays === 1 ? 'dia' : 'dias'}`);
                }

                if (remainingHours > 0) {
                    timeParts.push(`${remainingHours} ${remainingHours === 1 ? 'hora' : 'horas'}`);
                }

                if (remainingMinutes > 0 && totalDays === 0) {
                    timeParts.push(`${remainingMinutes} ${remainingMinutes === 1 ? 'minuto' : 'minutos'}`);
                }

                if (remainingSeconds > 0 && totalHours === 0 && totalDays === 0) {
                    timeParts.push(`${remainingSeconds} ${remainingSeconds === 1 ? 'segundo' : 'segundos'}`);
                }

                if (timeParts.length === 0) {
                    return "O evento está prestes a ocorrer";
                }

                if (timeParts.length === 1) {
                    return timeParts[0];
                }

                if (timeParts.length === 2) {
                    return `${timeParts[0]} e ${timeParts[1]}`;
                }

                const lastPart = timeParts.pop();
                return `${timeParts.join(', ')} e ${lastPart}`;
            };

            if (hasCooldown) return reply.status(429).send({ error: `You can vote again in ${getRemainingTime(hasCooldown.endIn)}`, voteText: getRemainingTime(hasCooldown.endIn), voteDate: hasCooldown.endIn });

            const guildUser = server === "eris" ? await client.guilds.cache.get("1395383469210865694")?.members.fetch(userId).catch(() => null) : await client.guilds.cache.get("1338980027529957396")?.members.fetch(userId).catch(() => null);

            if (!guildUser) return reply.status(404).send({ error: "User not found in guild" });

            server === "eris" ?
                await asPrisma.$transaction([
                    asPrisma.votes.create({
                        data: {
                            userId: userId,
                            applicationId: botId,
                            origin: "WEBSITE",
                        }
                    }),
                    asPrisma.cooldown.upsert({
                        where: { userId_name: { userId, name: "vote" } },
                        create: {
                            userId,
                            name: "vote",
                            endIn: new Date(Date.now() + 1000 * 60 * 60 * 3)
                        },
                        update: {
                            endIn: new Date(Date.now() + 1000 * 60 * 60 * 3)
                        }
                    })
                ])
                :
                await dzonePrisma.$transaction([
                    dzonePrisma.votes.create({
                        data: {
                            userId: userId,
                            applicationId: botId,
                            origin: "WEBSITE",
                        }
                    }),
                    dzonePrisma.cooldown.upsert({
                        where: { userId_name: { userId, name: "vote" } },
                        create: {
                            userId,
                            name: "vote",
                            endIn: new Date(Date.now() + 1000 * 60 * 60 * 3)
                        },
                        update: {
                            endIn: new Date(Date.now() + 1000 * 60 * 60 * 3)
                        }
                    })
                ])

            return reply.status(200).send({ message: "Vote added", votes: application.votes?.length || 1 })
        } catch (error) {
            reply.status(500).send({ error: 'Erro ao verificar o reCAPTCHA' });
        }
    });
};