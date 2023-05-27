import Boom from '@hapi/boom';
import Hapi from '@hapi/hapi';
import Jwt from '@hapi/jwt';
import config from '../../config/config.js';
import AuthenticationError from '../../exception/authentication-error.js';
import getAuthBearerToken from '../../helpers/get-auth-bearer-token.js';
import verifyToken from '../../helpers/verify-token.js';
import type { DecodedTokenPayloadProps } from '../../types/types.js';

const jwtAuthBearerScheme: Hapi.ServerAuthScheme<
  object,
  Hapi.ReqRefDefaults
> = () => {
  return {
    authenticate: (request, h) => {
      try {
        const requestHeaders = request.headers as {
          authorization: string;
        };

        if (requestHeaders.authorization === undefined)
          throw new AuthenticationError('unauthorized');

        const [authScheme, token] = getAuthBearerToken(
          requestHeaders.authorization
        );

        if (authScheme !== 'Bearer')
          return Boom.unauthorized('Auth scheme is invalid');

        const decodedToken = Jwt.token.decode(token);
        const tokenVerified = verifyToken(decodedToken, config.JWT_KEY);
        const tokenInvalid = tokenVerified.error;

        if (tokenInvalid) {
          return Boom.unauthorized(tokenVerified.error);
        }

        const { userId } = decodedToken.decoded
          .payload as DecodedTokenPayloadProps;

        return h.authenticated({
          credentials: {
            userId,
          },
        });
      } catch (error) {
        return Boom.unauthorized((error as Error).message);
      }
    },
  };
};

export default jwtAuthBearerScheme;
