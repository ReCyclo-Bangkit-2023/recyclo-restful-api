import type { ReqRefDefaults } from '@hapi/hapi/lib/types/request.js';
import type { ServerRoute } from '@hapi/hapi/lib/types/route.js';
import Joi from 'joi';
import { register } from '../handlers/recyclo-handlers.js';

const routes: ServerRoute<ReqRefDefaults>[] = [
  {
    method: 'POST',
    path: '/register',
    options: {
      validate: {
        payload: Joi.object({
          fullname: Joi.string().trim().min(1).max(100),
          email: Joi.string().email(),
          password: Joi.string().min(8),
          address: Joi.string().min(1),
          city: Joi.string(),
          phoneNumber: Joi.string(),
        }),
      },
    },
    handler: register,
  },
];
export default routes;
