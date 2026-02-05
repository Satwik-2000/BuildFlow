import { requireAuth } from "../../auth/jwt.js";
import { Prisma } from "../../../generated/prisma/client.js";
import type { GraphQLContext } from "../context.js";

export default {
  Query: {
    raBills: (_: unknown, { projectId, contractId, status }: { projectId?: string; contractId?: string; status?: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.rABill.findMany({
        where: {
          ...(projectId && { projectId }),
          ...(contractId && { contractId }),
          ...(status && { status: status as "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "PAID" }),
        },
        include: { project: true, contract: true, items: true },
        orderBy: { createdAt: "desc" },
      });
    },
    raBill: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.rABill.findUnique({
        where: { id },
        include: { project: true, contract: true, items: true, payments: true },
      });
    },
  },
  Mutation: {
    createRABill: async (_: unknown, { input }: { input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.rABill.create({
        data: {
          projectId: input.projectId as string,
          contractId: input.contractId as string,
          billNo: input.billNo as string,
          periodFrom: new Date(input.periodFrom as string),
          periodTo: new Date(input.periodTo as string),
          totalAmount: input.totalAmount as Prisma.Decimal,
        },
        include: { project: true, contract: true, items: true },
      });
    },
    updateRABill: async (_: unknown, { id, input }: { id: string; input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      const data: Record<string, unknown> = { ...input };
      if (input.periodFrom) data.periodFrom = new Date(input.periodFrom as string);
      if (input.periodTo) data.periodTo = new Date(input.periodTo as string);
      return ctx.prisma.rABill.update({
        where: { id },
        data,
        include: { project: true, contract: true, items: true },
      });
    },
    addBillItems: async (
      _: unknown,
      { raBillId, items }: { raBillId: string; items: Array<{ boqRef: string; description: string; quantity: number; unit: string; rate: number; previousQty?: number; currentQty?: number }> },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);
      const createData = items.map((i) => ({
        raBillId,
        boqRef: i.boqRef,
        description: i.description,
        quantity: new Prisma.Decimal(i.quantity),
        unit: i.unit,
        rate: new Prisma.Decimal(i.rate),
        amount: new Prisma.Decimal(i.quantity * i.rate),
        previousQty: i.previousQty != null ? new Prisma.Decimal(i.previousQty) : null,
        currentQty: i.currentQty != null ? new Prisma.Decimal(i.currentQty) : null,
      }));
      await ctx.prisma.billItem.createMany({ data: createData });
      const bill = await ctx.prisma.billItem.aggregate({ where: { raBillId }, _sum: { amount: true } });
      await ctx.prisma.rABill.update({
        where: { id: raBillId },
        data: { totalAmount: bill._sum.amount ?? 0 },
      });
      return ctx.prisma.rABill.findUnique({
        where: { id: raBillId },
        include: { project: true, contract: true, items: true },
      });
    },
  },
};
