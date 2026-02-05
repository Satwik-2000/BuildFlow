import { GraphQLScalarType, Kind } from "graphql";
import { mergeResolvers } from "@graphql-tools/merge";
import authResolvers from "./auth.js";
import projectResolvers from "./project.js";
import vendorResolvers from "./vendor.js";
import contractResolvers from "./contract.js";
import milestoneResolvers from "./milestone.js";
import reportResolvers from "./report.js";
import raBillResolvers from "./raBill.js";
import paymentResolvers from "./payment.js";
import variationResolvers from "./variation.js";
import documentResolvers from "./document.js";
import notificationResolvers from "./notification.js";
import dashboardResolvers from "./dashboard.js";

const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  serialize: (v: unknown) => (v instanceof Date ? v.toISOString() : v),
  parseValue: (v: unknown) => (typeof v === "string" ? new Date(v) : v),
  parseLiteral: (ast) => (ast.kind === Kind.STRING ? new Date(ast.value) : null),
});

const DecimalScalar = new GraphQLScalarType({
  name: "Decimal",
  serialize: (v: unknown) => v,
  parseValue: (v: unknown) => v,
  parseLiteral: (ast) => (ast.kind === Kind.STRING || ast.kind === Kind.INT || ast.kind === Kind.FLOAT ? (ast as { value: string }).value : null),
});

const scalarResolvers = {
  DateTime: DateTimeScalar,
  Decimal: DecimalScalar,
};

export default mergeResolvers([
  scalarResolvers as never,
  authResolvers,
  projectResolvers,
  vendorResolvers,
  contractResolvers,
  milestoneResolvers,
  reportResolvers,
  raBillResolvers,
  paymentResolvers,
  variationResolvers,
  documentResolvers,
  notificationResolvers,
  dashboardResolvers,
]);
