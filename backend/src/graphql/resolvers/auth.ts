import bcrypt from "bcryptjs";
import { requireAuth } from "../../auth/jwt.js";
import { createToken } from "../../auth/jwt.js";
import type { GraphQLContext } from "../context.js";

export default {
  Query: {
    me: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.user) return null;
      return ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { id: true, email: true, name: true, role: true, phone: true, avatarUrl: true, isActive: true, createdAt: true },
      });
    },
    users: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, name: true, role: true, phone: true, avatarUrl: true, isActive: true, createdAt: true },
      });
    },
    user: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, name: true, role: true, phone: true, avatarUrl: true, isActive: true, createdAt: true },
      });
    },
  },
  Mutation: {
    login: async (_: unknown, { input }: { input: { email: string; password: string } }, ctx: GraphQLContext) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!user || !user.isActive) throw new Error("Invalid credentials");
      const ok = await bcrypt.compare(input.password, user.passwordHash);
      if (!ok) throw new Error("Invalid credentials");
      const token = createToken({ id: user.id, email: user.email, role: user.role });
      return {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, avatarUrl: user.avatarUrl, isActive: user.isActive, createdAt: user.createdAt },
      };
    },
    createUser: async (_: unknown, { input }: { input: { email: string; password: string; name: string; role?: string; phone?: string } }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      const hash = await bcrypt.hash(input.password, 10);
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          passwordHash: hash,
          name: input.name,
          role: (input.role as "ADMIN" | "MANAGER" | "ENGINEER" | "VIEWER") || "ENGINEER",
          phone: input.phone,
        },
        select: { id: true, email: true, name: true, role: true, phone: true, avatarUrl: true, isActive: true, createdAt: true },
      });
      return user;
    },
    updateUser: async (_: unknown, { id, input }: { id: string; input: { name?: string; role?: string; phone?: string; isActive?: boolean } }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.user.update({
        where: { id },
        data: input,
        select: { id: true, email: true, name: true, role: true, phone: true, avatarUrl: true, isActive: true, createdAt: true },
      });
    },
  },
};
