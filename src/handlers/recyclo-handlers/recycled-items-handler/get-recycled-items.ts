import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import type { RecycledItem } from '../../../types/types.js';

const firestoreDB = new Firestore();

const getRecycledItems = async (
  _: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  const recycledItemsRef = firestoreDB.collection(
    config.CLOUD_FIRESTORE_RECYCLED_ITEMS_COLLECTION
  );

  const recycledItemsSnapshot = await recycledItemsRef.get();

  const recycledItemDocsData: RecycledItem[] = [];

  recycledItemsSnapshot.forEach((transactionDoc) => {
    const recycledItemDocData = transactionDoc.data() as RecycledItem;
    recycledItemDocsData.push(recycledItemDocData);
  });

  const recycledItemData: (RecycledItem & {
    key: number;
  })[] = [];

  recycledItemDocsData.forEach((transactionDoc, idx) => {
    recycledItemData.push({
      key: idx + 1,
      ...transactionDoc,
    });
  });

  return h.response({
    error: false,
    message: 'success',
    data: recycledItemData,
  });
};

export default getRecycledItems;
