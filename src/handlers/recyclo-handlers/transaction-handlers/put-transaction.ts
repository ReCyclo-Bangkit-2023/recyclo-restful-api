import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';

export const confirmSellerTransaction = (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  return h.response('implement me');
};

export const orderCompleteTransaction = (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  return h.response('implement me');
};
