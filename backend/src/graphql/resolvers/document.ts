import { requireAuth } from "../../auth/jwt.js";
import type { GraphQLContext } from "../context.js";

export default {
  Query: {
    documents: (_: unknown, { projectId, category }: { projectId: string; category?: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.document.findMany({
        where: { projectId, ...(category && { category }) },
        orderBy: { createdAt: "desc" },
      });
    },
    document: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.document.findUnique({ where: { id } });
    },
  },
  Mutation: {
    createDocument: async (_: unknown, { input }: { input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.document.create({
        data: {
          projectId: input.projectId as string,
          title: input.title as string,
          category: input.category as string | undefined,
          fileUrl: input.fileUrl as string,
          fileName: input.fileName as string,
          fileSize: input.fileSize as number | undefined,
          mimeType: input.mimeType as string | undefined,
        },
      });
    },
    updateDocument: async (_: unknown, { id, input }: { id: string; input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.document.update({
        where: { id },
        data: input,
      });
    },
    deleteDocument: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.document.delete({ where: { id } });
    },
  },
};
