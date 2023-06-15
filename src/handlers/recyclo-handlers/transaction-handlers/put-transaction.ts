import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import NotFoundError from '../../../exception/not-found-error.js';
import type {
  RecycledItem,
  TransactionDocProps,
} from '../../../types/types.js';

const firestoreDB = new Firestore();

export const confirmSellerTransaction = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  try {
    const { transactionId } = request.params as {
      transactionId: string;
    };

    const transactionsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_TRANSACTIONS_COLLECTION
    );

    const transactionDocRef = transactionsRef.doc(transactionId);

    const transactionDocSnapshot = await transactionDocRef.get();

    if (!transactionDocSnapshot.exists)
      throw new NotFoundError('id transaksi tidak ditemukan');

    await transactionDocRef.update({
      statusTransaction: 'sending',
    });

    return h.response({
      error: false,
      message: 'success',
      data: {
        id: transactionId,
        statusTransaction: 'sending',
      },
    });
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

export const orderCompleteTransaction = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  try {
    const { transactionId } = request.params as {
      transactionId: string;
    };

    const transactionsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_TRANSACTIONS_COLLECTION
    );

    const transactionDocRef = transactionsRef.doc(transactionId);

    const transactionDocSnapshot = await transactionDocRef.get();

    if (!transactionDocSnapshot.exists)
      throw new NotFoundError('id transaksi tidak ditemukan');

    const transactionDocData =
      transactionDocSnapshot.data() as TransactionDocProps;

    const transactionRecycledItems = transactionDocData.recycledItems;

    const recycledItemsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_RECYCLED_ITEMS_COLLECTION
    );

    for (const transactionRecycledItem of transactionRecycledItems) {
      if (transactionRecycledItem.statusItemTransaction === 'rejected')
        continue;

      const recycledItem = transactionRecycledItem.recycledItem;
      const recycledItemDocRef = recycledItemsRef.doc(recycledItem.id);
      const recycledItemDocSnapshot = await recycledItemDocRef.get();

      if (!recycledItemDocSnapshot.exists)
        throw new NotFoundError(
          'id barang atau sampah daur ulang tidak ditemukan'
        );

      const recycledItemDocData =
        recycledItemDocSnapshot.data() as RecycledItem;

      await recycledItemDocRef.update({
        sold: recycledItemDocData.sold + transactionRecycledItem.itemCartAmount,
      });
    }

    await transactionDocRef.update({
      statusTransaction: 'done',
    });

    return h.response({
      error: false,
      message: 'success',
      data: {
        id: transactionId,
        statusTransaction: 'done',
      },
    });
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
