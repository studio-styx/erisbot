import { Prisma } from "#database";

declare module "#database" {
    export type TokenData = {
        access: string;
        refresh: string;
        type: string;
        expiresAt: Date;
    };

    interface User {
        token: TokenData | null;
    }
}
