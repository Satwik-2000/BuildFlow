import jwt from "jsonwebtoken";
import type { Request } from "express";
import type { AuthUser } from "../graphql/context.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function createToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function decodeAuthHeader(req: Request): Promise<AuthUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    return { id: payload.id, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function requireAuth(context: { user: AuthUser | null }): AuthUser {
  if (!context.user) throw new Error("Authentication required");
  return context.user;
}
