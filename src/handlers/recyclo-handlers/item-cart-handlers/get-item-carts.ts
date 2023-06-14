import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import type { ItemCartDocProps, RecycledItem } from '../../../types/types.js';

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
    stock: number;
  })[] = [];

  const recycledItemsRef = firestoreDB.collection(
    config.CLOUD_FIRESTORE_RECYCLED_ITEMS_COLLECTION
  );

  for (const [idx, itemCartDoc] of itemCartDocsData.entries()) {
    const recycledItemId = itemCartDoc.recycledId;
    const recycledItemDocRef = recycledItemsRef.doc(recycledItemId);
    const recycledItemDocSnapshot = await recycledItemDocRef.get();
    const recycledItemDocData = recycledItemDocSnapshot.data() as RecycledItem;

    itemCartsData.push({
      key: idx + 1,
      stock: recycledItemDocData.amount,
      ...itemCartDoc,
    });
  }

  return h.response({
    error: false,
    message: 'success',
    data: itemCartsData,
  });
};

export default getItemCarts;
