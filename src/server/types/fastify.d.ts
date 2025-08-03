import { Application } from "#prisma";

declare module "fastify" {
    interface FastifyRequest {
        application: { data: Application, tokenHash: string } | null;
    }
}

export {};
