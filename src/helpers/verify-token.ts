import Jwt from '@hapi/jwt';
import type { JwtTokenVerifyOpt } from '../types/types.js';

const verifyToken = (
  artifact: ReturnType<typeof Jwt.token.decode>,
  secret: string,
  options?: JwtTokenVerifyOpt
) => {
  try {
    Jwt.token.verify(artifact, secret, options);

    return {
      error: null,
    };
  } catch (error) {
    console.info(error);
    return {
      error: (error as Error).message,
    };
  }
};

export default verifyToken;
