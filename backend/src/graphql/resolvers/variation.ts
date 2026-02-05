import { requireAuth } from "../../auth/jwt.js";
import type { GraphQLContext } from "../context.js";

export default {
  Query: {
    variations: (_: unknown, { projectId, contractId, status }: { projectId?: string; contractId?: string; status?: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.variation.findMany({
        where: {
          ...(projectId && { projectId }),
          ...(contractId && { contractId }),
          ...(status && { status: status as "PENDING" | "APPROVED" | "REJECTED" }),
        },
        include: { project: true, contract: true },
        orderBy: { createdAt: "desc" },
      });
    },
    variation: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.variation.findUnique({
        where: { id },
        include: { project: true, contract: true },
      });
    },
  },
  Mutation: {
    createVariation: async (_: unknown, { input }: { input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.variation.create({
        data: {
          projectId: input.projectId as string,
          contractId: input.contractId as string,
          refNo: input.refNo as string,
          title: input.title as string,
          description: input.description as string,
          amount: input.amount as number,
        },
        include: { project: true, contract: true },
      });
    },
    updateVariation: async (_: unknown, { id, input }: { id: string; input: { status?: string } }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      const data: Record<string, unknown> = { ...input };
      if (input.status === "APPROVED") {
        data.approvedById = user.id;
        data.approvedAt = new Date();
      }
      return ctx.prisma.variation.update({
        where: { id },
        data,
        include: { project: true, contract: true },
      });
    },
  },
};
