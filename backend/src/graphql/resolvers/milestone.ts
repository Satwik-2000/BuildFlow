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
          amount: input.amount != null ? Number(input.amount) : undefined,
          percentage: input.percentage != null ? Number(input.percentage) : undefined,
        },
        include: { project: true, contract: true },
      });
    },
    updateMilestone: async (_: unknown, { id, input }: { id: string; input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      const data: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(input)) {
        if (key === 'dueDate' && value) data.dueDate = new Date(value as string);
        else if (key === 'completedAt' && value) data.completedAt = new Date(value as string);
        else if (key === 'amount' && value != null) data.amount = Number(value);
        else if (key === 'percentage' && value != null) data.percentage = Number(value);
        else if (value !== undefined) data[key] = value;
      }
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
