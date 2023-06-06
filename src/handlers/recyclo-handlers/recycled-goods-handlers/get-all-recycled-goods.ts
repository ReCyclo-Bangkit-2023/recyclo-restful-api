import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import type { RecycledGoodsDocProps } from '../../../types/types.js';

const firestoreDB = new Firestore();

const getAllRecycledGoods = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  const { userId } = request.auth.credentials as {
    userId: string;
  };

  const recycledGoodsRef = firestoreDB.collection('recycledGoods');
  const recycledGoodsData: RecycledGoodsDocProps[] = [];
  const recycledGoodsSnapshot = await recycledGoodsRef
    .where('userId', '==', userId)
    .get();

  recycledGoodsSnapshot.forEach((doc) => {
    const recycledGoodsDocData = doc.data() as RecycledGoodsDocProps;
    recycledGoodsData.push(recycledGoodsDocData);
  });

  return h
    .response({
      error: false,
      message: 'success',
      data: recycledGoodsData,
    })
    .code(200);
};

export default getAllRecycledGoods;
