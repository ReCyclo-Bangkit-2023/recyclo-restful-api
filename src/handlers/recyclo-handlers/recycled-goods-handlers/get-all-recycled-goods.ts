import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import type { RecycledGoodsDocProps } from '../../../types/types.js';

const firestoreDB = new Firestore();

const getAllRecycledGoods = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  const { userId } = request.auth.credentials as {
    userId: string;
  };

  const recycledGoodsRef = firestoreDB.collection(
    config.CLOUD_FIRESTORE_RECYCLED_ITEMS_COLLECTION
  );
  const recycledGoodsSnapshotData: RecycledGoodsDocProps[] = [];
  const recycledGoodsSnapshot = await recycledGoodsRef
    .where('userId', '==', userId)
    .where('recycledType', '==', 'recycledGoods')
    .get();

  recycledGoodsSnapshot.forEach((doc) => {
    const recycledGoodsDocData = doc.data() as RecycledGoodsDocProps;
    recycledGoodsSnapshotData.push(recycledGoodsDocData);
  });

  const recycledGoodsData: (RecycledGoodsDocProps & {
    key: number;
  })[] = [];

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
