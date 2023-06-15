import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import type { RecycledItem, UserDataDocProps } from '../../../types/types.js';

const firestoreDB = new Firestore();

const getRecycledItems = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  const { name = '', bestseller = '0' } = request.query as {
    name: string;
    bestseller: string;
  };

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
    sellerDetails: Omit<UserDataDocProps, 'password'>;
  })[] = [];

  const usersRef = firestoreDB.collection('users');

  const filteredRecycledItemDocsData = recycledItemDocsData.filter(
    (recycledItemDocData) =>
      recycledItemDocData.title
        .toLowerCase()
        .split(' ')
        .join('')
        .startsWith(name.toLowerCase().split(' ').join(''))
  );

  for (const recycledItemDocData of filteredRecycledItemDocsData) {
    const { password: _, ...userDocData } = (
      await usersRef.doc(recycledItemDocData.userId).get()
    ).data() as UserDataDocProps;

    if (recycledItemDocData.userId === userDocData.userId) continue;

    recycledItemData.push({
      sellerDetails: userDocData,
      ...recycledItemDocData,
    });
  }

  if (bestseller === '1') {
    return h
      .response({
        error: false,
        message: 'success',
        data: recycledItemData
          .sort((a, b) => b.sold - a.sold)
          .map((recycledItem, idx) => ({
            ...recycledItem,
            key: idx + 1,
          }))
          .slice(0, 4),
      })
      .code(200);
  }

  const recycledItems: (RecycledItem & {
    key: number;
    sellerDetails: Omit<UserDataDocProps, 'password'>;
  })[] = [];

  recycledItemData.forEach((recycledItem, idx) => {
    recycledItems.push({
      key: idx + 1,
      ...recycledItem,
    });
  });

  return h
    .response({
      error: false,
      message: 'success',
      data: recycledItems,
    })
    .code(200);
};

export default getRecycledItems;
