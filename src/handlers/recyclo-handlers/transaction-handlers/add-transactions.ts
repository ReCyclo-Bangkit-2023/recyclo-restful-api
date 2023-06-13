import { Firestore, Timestamp } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import NotFoundError from '../../../exception/not-found-error.js';
import ValidationError from '../../../exception/validation-error.js';
import type {
  AddTransactionReqBodyProps,
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

    const transactionsPayload = request.payload as AddTransactionReqBodyProps[];

    if (!Array.isArray(transactionsPayload))
      throw new ValidationError('request body tidak valid');

    const recycledItemsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_RECYCLED_ITEMS_COLLECTION
    );

    const transactionsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_TRANSACTIONS_COLLECTION
    );

    const newTransactionIds: { id: string }[] = [];

    for (const transaction of transactionsPayload) {
      const recycledItemDocRef = recycledItemsRef.doc(transaction.recycledId);
      const recycledItemId = recycledItemDocRef.id;

      await firestoreDB.runTransaction(async (tx) => {
        const recycledItemDocSnapshot = await tx.get(recycledItemDocRef);

        if (!recycledItemDocSnapshot.exists)
          throw new NotFoundError(
            'id barang atau sampah daur ulang tidak ditemukan'
          );

        const recycledItemData = recycledItemDocSnapshot.data() as RecycledItem;

        const transactionAmountExceeded =
          recycledItemData.amount < transaction.amount;

        if (transactionAmountExceeded) return;

        const transactionDocRef = transactionsRef.doc();
        const transactionId = transactionDocRef.id;

        const newTransaction: TransactionDocProps = {
          id: transactionId,
          userId,
          recycledId: recycledItemId,
          title: recycledItemData.title,
          totalPrice: transaction.amount * recycledItemData.price + 1000,
          amount: transaction.amount,
          statusTransaction: 'waiting',
          orderedDate: Timestamp.fromDate(new Date()),
        };

        tx.update(recycledItemDocRef, {
          amount: recycledItemData.amount - transaction.amount,
        });

        await transactionDocRef.set(newTransaction);

        newTransactionIds.push({
          id: transactionId,
        });
      });
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
