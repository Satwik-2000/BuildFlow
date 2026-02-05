import { requireAuth } from "../../auth/jwt.js";
import type { GraphQLContext } from "../context.js";

export default {
  Query: {
    contracts: (_: unknown, { projectId, vendorId }: { projectId?: string; vendorId?: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.contract.findMany({
        where: {
          ...(projectId && { projectId }),
          ...(vendorId && { vendorId }),
        },
        include: { project: true, vendor: true },
        orderBy: { createdAt: "desc" },
      });
    },
    contract: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.contract.findUnique({
        where: { id },
        include: { project: true, vendor: true, milestones: true, raBills: true },
      });
    },
  },
  Mutation: {
    createContract: async (_: unknown, { input }: { input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.contract.create({
        data: {
          projectId: input.projectId as string,
          vendorId: input.vendorId as string,
          contractNo: input.contractNo as string,
          title: input.title as string,
          value: input.value as number,
          startDate: new Date(input.startDate as string),
          endDate: input.endDate ? new Date(input.endDate as string) : undefined,
          description: input.description as string | undefined,
        },
        include: { project: true, vendor: true },
      });
    },
    updateContract: async (_: unknown, { id, input }: { id: string; input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      const data: Record<string, unknown> = { ...input };
      if (input.startDate) data.startDate = new Date(input.startDate as string);
      if (input.endDate) data.endDate = new Date(input.endDate as string);
      if (typeof input.value === "number") data.value = input.value;
      return ctx.prisma.contract.update({
        where: { id },
        data,
        include: { project: true, vendor: true },
      });
    },
    deleteContract: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.contract.delete({ where: { id } });
    },
  },
};
