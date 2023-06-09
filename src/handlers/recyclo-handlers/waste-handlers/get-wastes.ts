import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';

const getWastes = (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  return h.response('implement me');
};

export default getWastes;
