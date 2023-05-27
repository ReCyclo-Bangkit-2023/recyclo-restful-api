import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';

const deleteWaste = (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  return h.response('implement me');
};

export default deleteWaste;
