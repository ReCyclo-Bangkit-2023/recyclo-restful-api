import type { ReqRefDefaults, Request } from '@hapi/hapi';

const putWaste = (
  request: Request<ReqRefDefaults>
  // h: ResponseToolkit<ReqRefDefaults>
) => {
  interface WasteDataProps {
    wasteId: string;
    userId: string;
    title: string;
    price: string;
    amount: string;
    hero: string;
    lat: string;
    long: string;
    sold: string;
  }
  const data = request.payload as WasteDataProps;
  const WasteId = request.params.wasteId as string;
  return JSON.stringify({
    message: `implement PUT with wasteId ${WasteId}`,
    data: {
      wasteId: WasteId,
      userId: data.userId,
    },
  });
};

export default putWaste;
