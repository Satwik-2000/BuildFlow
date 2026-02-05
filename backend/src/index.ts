import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "./graphql/schema.js";
import resolvers from "./graphql/resolvers/index.js";
import { getContext } from "./graphql/context.js";

const PORT = process.env.PORT || 4000;

export async function createApp() {
  const app = express();
  const httpServer = http.createServer(app);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>({ origin: true }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => getContext(req),
    })
  );

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  return { app, httpServer };
}

import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createApp().then(async ({ httpServer }) => {
    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  }).catch(console.error);
}
