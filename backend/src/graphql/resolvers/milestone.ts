import { requireAuth } from "../../auth/jwt.js";
import type { GraphQLContext } from "../context.js";

export default {
  Query: {
    milestones: (_: unknown, { projectId, contractId }: { projectId?: string; contractId?: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.milestone.findMany({
        where: {
          ...(projectId && { projectId }),
          ...(contractId && { contractId }),
        },
        include: { project: true, contract: true },
        orderBy: { dueDate: "asc" },
      });
    },
    milestone: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.milestone.findUnique({
        where: { id },
        include: { project: true, contract: true },
      });
    },
  },
  Mutation: {
    createMilestone: async (_: unknown, { input }: { input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.milestone.create({
        data: {
          projectId: input.projectId as string,
          contractId: input.contractId as string | undefined,
          name: input.name as string,
          description: input.description as string | undefined,
          dueDate: input.dueDate ? new Date(input.dueDate as string) : undefined,
          amount: input.amount != null ? input.amount : undefined,
          percentage: input.percentage != null ? input.percentage : undefined,
        },
        include: { project: true, contract: true },
      });
    },
    updateMilestone: async (_: unknown, { id, input }: { id: string; input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      const data: Record<string, unknown> = { ...input };
      if (input.dueDate) data.dueDate = new Date(input.dueDate as string);
      if (input.completedAt) data.completedAt = new Date(input.completedAt as string);
      if (input.amount != null) data.amount = input.amount;
      if (input.percentage != null) data.percentage = input.percentage;
      return ctx.prisma.milestone.update({
        where: { id },
        data,
        include: { project: true, contract: true },
      });
    },
    deleteMilestone: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.milestone.delete({ where: { id } });
    },
  },
};
