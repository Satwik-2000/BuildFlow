import { requireAuth } from "../../auth/jwt.js";
import type { GraphQLContext } from "../context.js";

export default {
  Query: {
    dashboardStats: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireAuth(ctx);
      const [totalProjects, activeContracts, pendingBills, overduePayments, recentReports] = await Promise.all([
        ctx.prisma.project.count({ where: { status: "active" } }),
        ctx.prisma.contract.count({ where: { status: "active" } }),
        ctx.prisma.rABill.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
        ctx.prisma.payment.count({ where: { status: "PENDING" } }),
        ctx.prisma.dailyReport.count({ where: { reportDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      ]);
      return { totalProjects, activeContracts, pendingBills, overduePayments, recentReports };
    },
    projectSummaries: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireAuth(ctx);
      const projects = await ctx.prisma.project.findMany({
        where: { status: "active" },
        select: { id: true, name: true, code: true, status: true, budget: true },
        take: 10,
      });
      const summaries = await Promise.all(
        projects.map(async (p) => {
          const milestones = await ctx.prisma.milestone.findMany({
            where: { projectId: p.id },
            select: { percentage: true, status: true },
          });
          const completed = milestones.filter((m) => m.status === "completed").length;
          const progress = milestones.length > 0 ? (completed / milestones.length) * 100 : 0;
          return {
            ...p,
            progress,
          };
        })
      );
      return summaries;
    },
  },
};
