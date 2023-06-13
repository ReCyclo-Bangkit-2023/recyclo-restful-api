import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import type { ItemCartDocProps } from '../../../types/types.js';

const firestoreDB = new Firestore();

const getItemCarts = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  const { userId } = request.auth.credentials as {
    userId: string;
  };

  const itemCartsRef = firestoreDB.collection(
    config.CLOUD_FIRESTORE_CARTS_COLLECTION
  );

  const itemCartsSnapshot = await itemCartsRef
    .where('userId', '==', userId)
    .get();

  const itemCartDocsData: ItemCartDocProps[] = [];

  itemCartsSnapshot.forEach((itemCartDoc) => {
    const itemCartDocData = itemCartDoc.data() as ItemCartDocProps;
    itemCartDocsData.push(itemCartDocData);
  });

  const itemCartsData: (ItemCartDocProps & {
    key: number;
  })[] = [];

  itemCartDocsData.forEach((itemCartDoc, idx) => {
    itemCartsData.push({
      key: idx + 1,
      ...itemCartDoc,
    });
  });

  return h.response({
    error: false,
    message: 'success',
    data: itemCartsData,
  });
};

export default getItemCarts;
