import Hapi from '@hapi/hapi';
import jwtAuthBearerScheme from './auth/scheme/jwt-auth-bearer-scheme.js';
import routes from './routes/routes.js';

export const initHapiServer = async () => {
  const hapiServer = Hapi.server({
    port: 8080,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  hapiServer.auth.scheme('jwt-auth-bearer', jwtAuthBearerScheme);

  hapiServer.auth.strategy('jwt-auth-bearer', 'jwt-auth-bearer');

  hapiServer.route(routes);

  await hapiServer.start();

  console.info(`Server is running on ${hapiServer.info.uri}`);
};

void initHapiServer();
