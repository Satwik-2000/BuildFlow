import { requireAuth } from "../../auth/jwt.js";
import type { GraphQLContext } from "../context.js";

export default {
  Query: {
    payments: (_: unknown, { raBillId }: { raBillId?: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.payment.findMany({
        where: raBillId ? { raBillId } : undefined,
        orderBy: { paymentDate: "desc" },
      });
    },
    payment: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.payment.findUnique({
        where: { id },
        include: { raBill: true },
      });
    },
  },
  Mutation: {
    createPayment: async (_: unknown, { input }: { input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.payment.create({
        data: {
          raBillId: input.raBillId as string | undefined,
          amount: input.amount as number,
          paymentDate: new Date(input.paymentDate as string),
          referenceNo: input.referenceNo as string | undefined,
          notes: input.notes as string | undefined,
        },
      });
    },
    updatePayment: async (_: unknown, { id, input }: { id: string; input: Record<string, unknown> }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      const data: Record<string, unknown> = { ...input };
      if (input.paymentDate) data.paymentDate = new Date(input.paymentDate as string);
      return ctx.prisma.payment.update({
        where: { id },
        data,
      });
    },
  },
};
