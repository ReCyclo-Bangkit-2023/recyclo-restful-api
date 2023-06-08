import type { ReqRefDefaults, Request } from '@hapi/hapi';

const addWaste = (
  request: Request<ReqRefDefaults>
  // h: ResponseToolkit<ReqRefDefaults>
) => {
  const data = request.payload;

  return JSON.stringify({
    message: 'implement me POST',
    data: data,
  });
};

export default addWaste;
