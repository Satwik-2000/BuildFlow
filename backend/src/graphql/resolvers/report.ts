import { requireAuth } from "../../auth/jwt.js";
import type { GraphQLContext } from "../context.js";

export default {
  Query: {
    dailyReports: (_: unknown, { projectId, from, to }: { projectId: string; from?: string; to?: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.dailyReport.findMany({
        where: {
          projectId,
          ...(from && to && { reportDate: { gte: new Date(from), lte: new Date(to) } }),
        },
        include: { photos: true, project: true },
        orderBy: { reportDate: "desc" },
      });
    },
    dailyReport: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.dailyReport.findUnique({
        where: { id },
        include: { photos: true, project: true, createdBy: true },
      });
    },
  },
  Mutation: {
    createDailyReport: async (_: unknown, { input }: { input: Record<string, unknown> }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      return ctx.prisma.dailyReport.create({
        data: {
          projectId: input.projectId as string,
          createdById: user.id,
          reportDate: new Date(input.reportDate as string),
          weather: input.weather as string | undefined,
          workDone: input.workDone as string,
          manpower: input.manpower as number | undefined,
          equipment: input.equipment as string | undefined,
          issues: input.issues as string | undefined,
          remarks: input.remarks as string | undefined,
        },
        include: { photos: true },
      });
    },
    updateDailyReport: async (_: unknown, { id, input }: { id: string; input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.dailyReport.update({
        where: { id },
        data: input,
        include: { photos: true },
      });
    },
    deleteDailyReport: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.dailyReport.delete({ where: { id } });
    },
    addReportPhoto: async (_: unknown, { input }: { input: { dailyReportId: string; url: string; caption?: string } }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.reportPhoto.create({
        data: { dailyReportId: input.dailyReportId, url: input.url, caption: input.caption },
      });
    },
    removeReportPhoto: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.reportPhoto.delete({ where: { id } });
    },
  },
};
