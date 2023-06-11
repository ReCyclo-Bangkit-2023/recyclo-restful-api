import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import type {
  RecycledGoodsDocProps,
  RecycledGoodsResBodyProps,
} from '../../../types/types.js';

const firestoreDB = new Firestore();

const getAllRecycledGoods = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  const { userId } = request.auth.credentials as {
    userId: string;
  };

  const recycledGoodsRef = firestoreDB.collection('recycledGoods');
  const recycledGoodsSnapshotData: RecycledGoodsDocProps[] = [];
  const recycledGoodsSnapshot = await recycledGoodsRef
    .where('userId', '==', userId)
    .get();

  recycledGoodsSnapshot.forEach((doc) => {
    const recycledGoodsDocData = doc.data() as RecycledGoodsDocProps;
    recycledGoodsSnapshotData.push(recycledGoodsDocData);
  });

  const recycledGoodsData: RecycledGoodsResBodyProps[] = [];

  recycledGoodsSnapshotData.forEach((recycledGoods, idx) => {
    recycledGoodsData.push({
      key: idx + 1,
      ...recycledGoods,
    });
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
