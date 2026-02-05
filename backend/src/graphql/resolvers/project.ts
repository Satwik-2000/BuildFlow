import { requireAuth } from "../../auth/jwt.js";
import type { GraphQLContext } from "../context.js";

export default {
  Query: {
    projects: (_: unknown, { search, status }: { search?: string; status?: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.project.findMany({
        where: {
          ...(search && { OR: [{ name: { contains: search, mode: "insensitive" } }, { code: { contains: search, mode: "insensitive" } }] }),
          ...(status && { status }),
        },
        orderBy: { createdAt: "desc" },
      });
    },
    project: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.project.findUnique({
        where: { id },
        include: { contracts: true, milestones: true },
      });
    },
  },
  Mutation: {
    createProject: async (_: unknown, { input }: { input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.project.create({
        data: {
          name: input.name as string,
          code: input.code as string,
          description: input.description as string | undefined,
          location: input.location as string | undefined,
          startDate: input.startDate ? new Date(input.startDate as string) : undefined,
          endDate: input.endDate ? new Date(input.endDate as string) : undefined,
          budget: input.budget != null ? input.budget : undefined,
        },
      });
    },
    updateProject: async (_: unknown, { id, input }: { id: string; input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      const data: Record<string, unknown> = { ...input };
      if (input.startDate) data.startDate = new Date(input.startDate as string);
      if (input.endDate) data.endDate = new Date(input.endDate as string);
      return ctx.prisma.project.update({
        where: { id },
        data,
      });
    },
    deleteProject: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.project.delete({ where: { id } });
    },
  },
};
