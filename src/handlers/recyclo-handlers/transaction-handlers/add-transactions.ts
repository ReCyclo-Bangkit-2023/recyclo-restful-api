import { Firestore, Timestamp } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import { format } from 'date-fns';
import config from '../../../config/config.js';
import NotFoundError from '../../../exception/not-found-error.js';
import ValidationError from '../../../exception/validation-error.js';
import type {
  ItemCartDocProps,
  RecycledItem,
  TransactionDocProps,
} from '../../../types/types.js';

const firestoreDB = new Firestore();

const addTransactions = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  try {
    const { userId } = request.auth.credentials as {
      userId: string;
    };

    // Get all user item carts
    const itemCartsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_CARTS_COLLECTION
    );

    const itemCartsSnapshot = await itemCartsRef
      .where('userId', '==', userId)
      .get();

    const itemCartIds: string[] = [];
    const itemCartDocsData: ItemCartDocProps[] = [];

    itemCartsSnapshot.forEach((itemCartDoc) => {
      const itemCartDocData = itemCartDoc.data() as ItemCartDocProps;
      itemCartDocsData.push(itemCartDocData);
      itemCartIds.push(itemCartDoc.id);
    });

    if (itemCartDocsData.length === 0) throw new Error('item cart Anda kosong');

    const recycledItemsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_RECYCLED_ITEMS_COLLECTION
    );

    const transactionsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_TRANSACTIONS_COLLECTION
    );

    const newTransactionIds: { id: string }[] = [];

    for (const itemCartDocData of itemCartDocsData) {
      const recycledItemDocRef = recycledItemsRef.doc(
        itemCartDocData.recycledId
      );

      const recycledItemId = recycledItemDocRef.id;

      await firestoreDB.runTransaction(async (tx) => {
        const recycledItemDocSnapshot = await tx.get(recycledItemDocRef);

        if (!recycledItemDocSnapshot.exists)
          throw new NotFoundError(
            'id barang atau sampah daur ulang tidak ditemukan'
          );

        const recycledItemData = recycledItemDocSnapshot.data() as RecycledItem;

        const transactionAmountExceeded =
          recycledItemData.amount < itemCartDocData.amount;

        if (transactionAmountExceeded) return;

        const transactionDocRef = transactionsRef.doc();
        const transactionId = transactionDocRef.id;

        const newTransaction: TransactionDocProps = {
          id: transactionId,
          userId,
          recycledId: recycledItemId,
          image: recycledItemData.image1,
          title: recycledItemData.title,
          totalPrice: itemCartDocData.amount * recycledItemData.price + 1000,
          amount: itemCartDocData.amount,
          statusTransaction: 'waiting',
          orderedDate: format(new Date(), 'dd-MM-yyyy, HH:mm:ss'),
          orderedTimestamp: Timestamp.fromDate(new Date()).toMillis(),
        };

        tx.update(recycledItemDocRef, {
          amount: recycledItemData.amount - itemCartDocData.amount,
        });

        await transactionDocRef.set(newTransaction);

        newTransactionIds.push({
          id: transactionId,
        });
      });
    }

    for (const itemCartId of itemCartIds) {
      await itemCartsRef.doc(itemCartId).delete();
    }

    return h
      .response({
        error: false,
        message: 'success',
        data: newTransactionIds,
      })
      .code(201);
  } catch (error) {
    if (error instanceof ValidationError) {
      return h
        .response({
          error: true,
          message: error.message,
          data: {},
        })
        .code(400);
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

export default addTransactions;
