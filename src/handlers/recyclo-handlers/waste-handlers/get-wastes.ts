const getWastes = () =>
  // request: Request<ReqRefDefaults>,
  // h: ResponseToolkit<ReqRefDefaults>
  {
    const data = {
      wasteId: '1',
      userId: 'user-1',
      title: 'Ini Title',
      price: '20.000',
      amount: '23',
      hero: 'Ini Hero',
      lat: 'Ini Lat',
      long: 'Ini Long',
      sold: 'Terjual',
    };
    return JSON.stringify({
      message: 'implement me GET',
      data: data,
    });
  };

export default getWastes;
