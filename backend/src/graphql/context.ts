import type { Request } from "express";
import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { decodeAuthHeader } from "../auth/jwt.js";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface GraphQLContext {
  prisma: PrismaClient;
  user: AuthUser | null;
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.DATABASE_URL?.includes("supabase") ? { rejectUnauthorized: false } : undefined,
});
const prisma = new PrismaClient({ adapter });

export async function getContext(req: Request): Promise<GraphQLContext> {
  const user = await decodeAuthHeader(req);
  return { prisma, user };
}
