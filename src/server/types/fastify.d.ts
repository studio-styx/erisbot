import { Application } from "#prisma";

declare module "fastify" {
    interface FastifyRequest {
        application: { data: Application, tokenHash: string } | null;
        userId: string | null;
    }
}

declare module '@fastify/websocket' {
    interface SocketStream {
        socket: WebSocket;
    }
}

export {};
