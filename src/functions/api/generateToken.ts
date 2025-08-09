import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export const jwtReservedToken = crypto.randomBytes(16).toString("hex");

export function generateJWT(userId: string) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET || jwtReservedToken,
    { expiresIn: "60m" }
  );
}