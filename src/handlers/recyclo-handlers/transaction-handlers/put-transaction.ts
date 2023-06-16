import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import NotFoundError from '../../../exception/not-found-error.js';
import type {
  RecycledItem,
  TransactionClientDocProps,
  TransactionSellerDocProps,
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

    const transactionClientRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_TRANSACTION_CLIENTS_COLLECTION
    );

    const transactionClientSnapshot = await transactionClientRef.get();

    const transactionClientDocs: TransactionClientDocProps[] = [];

    transactionClientSnapshot.forEach((transactionClientDoc) => {
      transactionClientDocs.push(
        transactionClientDoc.data() as TransactionClientDocProps
      );
    });

    const transactionSellerRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_TRANSACTION_SELLERS_COLLECTION
    );

    const transactionSellerSnapshot = await transactionSellerRef.get();

    const transactionSellerDocs: TransactionSellerDocProps[] = [];

    transactionSellerSnapshot.forEach((transactionSellerDoc) => {
      transactionSellerDocs.push(
        transactionSellerDoc.data() as TransactionSellerDocProps
      );
    });

    const transactionClientDoc = transactionClientDocs.find(
      (transactionClientDoc) => {
        const isExist = transactionClientDoc.transactionItemsDetails.findIndex(
          (transactionItemDetails) =>
            transactionItemDetails.transactionId === transactionId
        );

        if (isExist) return true;
        return false;
      }
    );

    const transactionSellerDoc = transactionSellerDocs.find(
      (transactionSellerDoc) => transactionSellerDoc.id === transactionId
    );

    if (
      transactionClientDoc === undefined ||
      transactionSellerDoc === undefined
    )
      throw new NotFoundError('id transaksi tidak ada');

    transactionClientDoc.transactionItemsDetails.map(
      (transactionItemDetails) => {
        return {
          ...transactionItemDetails,
          statusTransaction: (transactionItemDetails.statusTransaction =
            'sending'),
        };
      }
    );

    await transactionClientRef
      .doc(transactionClientDoc.id)
      .set(transactionClientDoc);

    transactionSellerDoc.statusTransaction = 'sending';

    await transactionSellerRef
      .doc(transactionSellerDoc.id)
      .set(transactionSellerDoc);

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

    const transactionClientRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_TRANSACTION_CLIENTS_COLLECTION
    );

    const transactionClientSnapshot = await transactionClientRef.get();

    const transactionClientDocs: TransactionClientDocProps[] = [];

    transactionClientSnapshot.forEach((transactionClientDoc) => {
      transactionClientDocs.push(
        transactionClientDoc.data() as TransactionClientDocProps
      );
    });

    const transactionSellerRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_TRANSACTION_SELLERS_COLLECTION
    );

    const transactionSellerSnapshot = await transactionSellerRef.get();

    const transactionSellerDocs: TransactionSellerDocProps[] = [];

    transactionSellerSnapshot.forEach((transactionSellerDoc) => {
      transactionSellerDocs.push(
        transactionSellerDoc.data() as TransactionSellerDocProps
      );
    });

    const transactionClientDoc = transactionClientDocs.find(
      (transactionClientDoc) => {
        const isExist = transactionClientDoc.transactionItemsDetails.findIndex(
          (transactionItemDetails) =>
            transactionItemDetails.transactionId === transactionId
        );

        if (isExist) return true;
        return false;
      }
    );

    const transactionSellerDoc = transactionSellerDocs.find(
      (transactionSellerDoc) => transactionSellerDoc.id === transactionId
    );

    if (
      transactionClientDoc === undefined ||
      transactionSellerDoc === undefined
    )
      throw new NotFoundError('id transaksi tidak ada');

    const recycledItemsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_RECYCLED_ITEMS_COLLECTION
    );

    const transactionItemsDetails =
      transactionClientDoc.transactionItemsDetails;

    for (const transactionDetails of transactionItemsDetails) {
      if (transactionDetails.transactionId !== transactionId) continue;

      const transactionItemDetails = transactionDetails.transactionItemDetails;

      for (const transactionItemDetail of transactionItemDetails) {
        if (transactionItemDetail.statusItemTransaction === 'rejected')
          continue;

        const txRecycledItem = transactionItemDetail.recycledItem;

        const recycledItemDocRef = recycledItemsRef.doc(txRecycledItem.id);

        const recycledItemDocSnapshot = await recycledItemDocRef.get();

        if (!recycledItemDocSnapshot.exists)
          throw new NotFoundError(
            'id barang atau sampah daur ulang tidak ditemukan'
          );

        const recycledItemDocData =
          recycledItemDocSnapshot.data() as RecycledItem;

        await recycledItemDocRef.update({
          sold: recycledItemDocData.sold + transactionItemDetail.itemCartAmount,
        });
      }
    }

    transactionClientDoc.transactionItemsDetails.map(
      (transactionItemDetails) => {
        if (transactionItemDetails.transactionId === transactionId) {
          return {
            ...transactionItemDetails,
            statusTransaction: 'done',
          };
        } else {
          return transactionItemDetails;
        }
      }
    );

    await transactionClientRef
      .doc(transactionClientDoc.id)
      .set(transactionClientDoc);

    await transactionSellerRef.doc(transactionId).update({
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
