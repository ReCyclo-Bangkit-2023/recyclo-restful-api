import type { ReqRefDefaults, Request } from '@hapi/hapi';

const deleteWaste = (
  request: Request<ReqRefDefaults>
  // h: ResponseToolkit<ReqRefDefaults>
) => {
  const WasteId = request.params.wasteId as string;
  return JSON.stringify({
    message: `implement DELETE with wasteId ${WasteId}`,
  });
};

export default deleteWaste;
