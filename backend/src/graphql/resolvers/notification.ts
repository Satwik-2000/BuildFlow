import { requireAuth } from "../../auth/jwt.js";
import type { GraphQLContext } from "../context.js";

export default {
  Query: {
    notifications: (_: unknown, { unreadOnly }: { unreadOnly?: boolean }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      return ctx.prisma.notification.findMany({
        where: { userId: user.id, ...(unreadOnly && { isRead: false }) },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    },
  },
  Mutation: {
    markNotificationRead: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
    },
    markAllNotificationsRead: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      await ctx.prisma.notification.updateMany({
        where: { userId: user.id },
        data: { isRead: true },
      });
      return true;
    },
  },
};
