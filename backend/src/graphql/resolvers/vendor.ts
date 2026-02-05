import { requireAuth } from "../../auth/jwt.js";
import type { GraphQLContext } from "../context.js";

export default {
  Query: {
    vendors: (_: unknown, { search, type }: { search?: string; type?: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.vendor.findMany({
        where: {
          ...(search && { OR: [{ name: { contains: search, mode: "insensitive" } }, { code: { contains: search, mode: "insensitive" } }] }),
          ...(type && { type }),
        },
        orderBy: { name: "asc" },
      });
    },
    vendor: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.vendor.findUnique({ where: { id } });
    },
  },
  Mutation: {
    createVendor: async (_: unknown, { input }: { input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.vendor.create({
        data: {
          name: input.name as string,
          code: input.code as string | undefined,
          type: input.type as string,
          contactPerson: input.contactPerson as string | undefined,
          email: input.email as string | undefined,
          phone: input.phone as string | undefined,
          address: input.address as string | undefined,
          taxId: input.taxId as string | undefined,
        },
      });
    },
    updateVendor: async (_: unknown, { id, input }: { id: string; input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.vendor.update({
        where: { id },
        data: input,
      });
    },
    deleteVendor: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.vendor.delete({ where: { id } });
    },
  },
};
