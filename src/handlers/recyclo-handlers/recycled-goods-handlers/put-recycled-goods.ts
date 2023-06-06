import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import NotFoundError from '../../../exception/not-found-error.js';
import type { PutRecycledGoodsReqBodyProps } from '../../../types/types.js';

const firestoreDB = new Firestore();

const putRecycledGoods = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  try {
    const { recycledGoodsId } = request.params as {
      recycledGoodsId: string;
    };

    const { title, price, kind, amount, desc, lat, long } =
      request.payload as PutRecycledGoodsReqBodyProps;

    const recycledGoodsDocRef = firestoreDB
      .collection('recycledGoods')
      .doc(recycledGoodsId);

    const recycledGoodsDoc = await recycledGoodsDocRef.get();

    if (!recycledGoodsDoc.exists) {
      throw new NotFoundError('barang daur ulang tidak ditemukan');
    }

    const updatedRecycledGoods = {
      title: title ? title : (recycledGoodsDoc.get('title') as string),
      price: price ? price : (recycledGoodsDoc.get('price') as number),
      kind: kind ? kind : (recycledGoodsDoc.get('kind') as string),
      amount: amount ? amount : (recycledGoodsDoc.get('amount') as number),
      desc: desc ? desc : (recycledGoodsDoc.get('desc') as string),
      lat: lat ? lat : (recycledGoodsDoc.get('lat') as string),
      long: long ? long : (recycledGoodsDoc.get('long') as string),
    };

    await recycledGoodsDocRef.update(updatedRecycledGoods);

    return h
      .response({
        error: false,
        message: 'success',
        data: {
          ...updatedRecycledGoods,
        },
      })
      .code(200);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return h
        .response({
          error: true,
          message: error.message,
          data: {},
        })
        .code(404);
    }

    return h
      .response({
        error: true,
        message: (error as Error).message,
        data: {},
      })
      .code(500);
  }
};

export default putRecycledGoods;
