import  jwt from "jsonwebtoken";
import { jwtReservedToken } from "./generateToken.js";

export function getJwtToken(token: string) {
    const secret = process.env.JWT_SECRET || (typeof jwtReservedToken === "function" ? jwtReservedToken : jwtReservedToken);
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    const userId = decoded.sub;

    if (typeof userId !== "string") return null;

    return userId;
}