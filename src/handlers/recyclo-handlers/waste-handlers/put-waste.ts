import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';

const putWaste = (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  return h.response('implement me');
};

export default putWaste;
