import Hapi from '@hapi/hapi';
import jwtAuthBearerScheme from './auth/scheme/jwt-auth-bearer-scheme.js';
import routes from './routes/routes.js';

const initHapiServer = async () => {
  const hapiServer = Hapi.server({
    port: process.env.PORT || 9000,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
  });

  hapiServer.auth.scheme('jwt-auth-bearer', jwtAuthBearerScheme);

  hapiServer.auth.strategy('jwt-auth-bearer', 'jwt-auth-bearer');

  hapiServer.route(routes);

  await hapiServer.start();

  console.info(`Server is running on ${hapiServer.info.uri}`);
};

void initHapiServer();
