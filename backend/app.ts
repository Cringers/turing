import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import * as express from 'express';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { CONFIG } from '@crossword/config';
import { AppDataSource } from '@crossword/db';
import { crosswordParser } from '@crossword/parser';
import { Crossword } from './entities/crossword';
import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';
import 'reflect-metadata';

async function startApolloServer(localTypeDefs, localResolvers) {
   // eslint-disable-next-line no-console
   console.log('Starting Apollo Server');
   const frontendApp = express();
   const frontendHttpApp = express();
   frontendApp.use(
      '/graphql',
      createProxyMiddleware({
         target: `http://localhost:${CONFIG.BACKEND_PORT}/graphql`,
         changeOrigin: true,
      }),
   );

   const backendApp = express();
   const backendServer = http.createServer(backendApp);
   const apiServer = new ApolloServer({
      typeDefs: localTypeDefs,
      resolvers: localResolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer: backendServer })],
   });
   backendApp.use(cors());
   frontendApp.use(cors()); // TODO pick CORS policy besides *

   await apiServer.start();
   apiServer.applyMiddleware({ app: backendApp });
   await new Promise<void>((resolve) => {
      backendServer.listen({ port: CONFIG.BACKEND_PORT }, resolve);
   });
   // eslint-disable-next-line no-console
   console.log(`🚀 Server ready at http://localhost:${CONFIG.BACKEND_PORT}${apiServer.graphqlPath}`);

   let frontendServer: https.Server;
   let frontendHttpServer: http.Server;

   switch (CONFIG.STAGE) {
      case 'production': {
         const key = fs.readFileSync(CONFIG.SSL_KEY, 'utf8');
         const cert = fs.readFileSync(CONFIG.SSL_CERT, 'utf8');
         const credentials = { key, cert };

         frontendServer = https.createServer(credentials, frontendApp);
         frontendHttpServer = http.createServer(frontendHttpApp);

         frontendApp.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
         });
         frontendHttpApp.get('*', (req, res) => {
            res.redirect(`https://${req.headers.host}${req.path}`);
         });
         frontendApp.use(express.static(path.join(__dirname, '../frontend/build')));
         frontendServer.listen({ port: CONFIG.FRONTEND_PORT });
         frontendHttpServer.listen({ port: 80 });
         // eslint-disable-next-line no-console
         console.log(`🚀 Server ready at http://localhost:${CONFIG.FRONTEND_PORT}/`);
         break;
      }
      case 'development':
         break;
      default:
         throw new Error(`Not a recognized stage: ${CONFIG.STAGE}`);
   }
}

// eslint-disable-next-line no-console
console.log('Connecting to ATP database');
async function start() {
   AppDataSource.initialize().then(async () => {
      const currentCrossword = CONFIG.CURRENT_CROSSWORD;
      const xword: Crossword = crosswordParser(currentCrossword);
      AppDataSource.manager.save(Crossword, xword);

      await startApolloServer(typeDefs, resolvers);
   });
}
start();
