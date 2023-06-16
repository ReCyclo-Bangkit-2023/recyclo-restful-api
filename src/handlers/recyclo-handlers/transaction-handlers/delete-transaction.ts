import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import NotFoundError from '../../../exception/not-found-error.js';
import {
  RecycledItem,
  TransactionClientDocProps,
} from '../../../types/types.js';

const firestoreDB = new Firestore();

const deleteTransaction = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  try {
    const { transactionClientId } = request.params as {
      transactionClientId: string;
    };

    const transactionClientRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_TRANSACTION_CLIENTS_COLLECTION
    );

    const transactionClientDocRef =
      transactionClientRef.doc(transactionClientId);

    const transactionClientDoc = (
      await transactionClientDocRef.get()
    ).data() as TransactionClientDocProps;

    const transactionItemsDetails =
      transactionClientDoc.transactionItemsDetails;

    const transactionIds: string[] = [];

    const recycledItemsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_RECYCLED_ITEMS_COLLECTION
    );

    for (const transactionDetails of transactionItemsDetails) {
      transactionIds.push(transactionDetails.transactionId);

      for (const transactionItem of transactionDetails.transactionItemDetails) {
        if (transactionItem.statusItemTransaction === 'rejected') continue;

        const txRecycledItem = transactionItem.recycledItem;

        const recycledItemDocRef = recycledItemsRef.doc(txRecycledItem.id);

        const recycledItemDocSnapshot = await recycledItemDocRef.get();

        if (!recycledItemDocSnapshot.exists)
          throw new NotFoundError(
            'id barang atau sampah daur ulang tidak ditemukan'
          );

        const recycledItemDocData =
          recycledItemDocSnapshot.data() as RecycledItem;

        await recycledItemDocRef.update({
          sold: recycledItemDocData.sold + transactionItem.itemCartAmount,
        });
      }
    }

    await transactionClientDocRef.delete();

    const transactionSellerRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_TRANSACTION_SELLERS_COLLECTION
    );

    for (const transactionId of transactionIds) {
      await transactionSellerRef.doc(transactionId).delete();
    }

    return h.response({
      error: false,
      message: 'success',
      data: {},
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

export default deleteTransaction;
