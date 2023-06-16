import { Firestore, Timestamp } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import { format } from 'date-fns';
import config from '../../../config/config.js';
import NotFoundError from '../../../exception/not-found-error.js';
import type {
  ItemCartDocProps,
  RecycledItem,
  TransactionDocProps,
  UserDataDocProps,
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

    if (itemCartDocsData.length === 0)
      throw new NotFoundError('item cart Anda kosong');

    const recycledItemsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_RECYCLED_ITEMS_COLLECTION
    );

    const transactionsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_TRANSACTIONS_COLLECTION
    );

    const transactionDocRef = transactionsRef.doc();
    const transactionId = transactionDocRef.id;

    const usersRef = firestoreDB.collection('users');
    const customerDocRef = usersRef.doc(userId);
    const { password: _, ...customerDocData } = (
      await customerDocRef.get()
    ).data() as UserDataDocProps;

    const newTransaction: TransactionDocProps = {
      id: transactionId,
      userDetails: customerDocData,
      recycledItems: [],
      totalPrice: 1000,
      totalAmount: 0,
      statusTransaction: 'waiting',
      orderedDate: '',
      orderedTimestamp: 0,
    };

    for (const itemCartDocData of itemCartDocsData) {
      const recycledItemDocRef = recycledItemsRef.doc(
        itemCartDocData.recycledId
      );

      await firestoreDB.runTransaction(async (tx) => {
        const recycledItemDocSnapshot = await tx.get(recycledItemDocRef);

        if (!recycledItemDocSnapshot.exists)
          throw new NotFoundError(
            'id barang atau sampah daur ulang tidak ditemukan'
          );

        const recycledItemData = recycledItemDocSnapshot.data() as RecycledItem;

        const transactionAmountExceeded =
          recycledItemData.amount < itemCartDocData.amount;

        const { password: _, ...sellerDocData } = (
          await usersRef.doc(recycledItemData.userId).get()
        ).data() as UserDataDocProps;

        if (transactionAmountExceeded) {
          newTransaction.recycledItems.push({
            recycledItem: recycledItemData,
            sellerDetails: sellerDocData,
            itemCartAmount: itemCartDocData.amount,
            statusItemTransaction: 'rejected',
            message: `stok tidak mencukupi. stok terkini ${recycledItemData.amount}`,
          });
          return;
        }

        newTransaction.recycledItems.push({
          recycledItem: {
            ...recycledItemData,
            amount: recycledItemData.amount - itemCartDocData.amount,
          },
          sellerDetails: sellerDocData,
          itemCartAmount: itemCartDocData.amount,
          statusItemTransaction: 'accepted',
          message: 'Stok tersedia',
        });

        newTransaction.totalPrice +=
          recycledItemData.price * itemCartDocData.amount;

        newTransaction.totalAmount += itemCartDocData.amount;

        tx.update(recycledItemDocRef, {
          amount: recycledItemData.amount - itemCartDocData.amount,
        });
      });
    }

    for (const itemCartId of itemCartIds) {
      await itemCartsRef.doc(itemCartId).delete();
    }

    const transactionsRejected = newTransaction.recycledItems.every(
      ({ statusItemTransaction }) => statusItemTransaction === 'rejected'
    );

    if (transactionsRejected) {
      return h
        .response({
          error: false,
          message: 'semua stok barang atau sampah daur ulang tidak mencukupi',
          data: {},
        })
        .code(204);
    }

    newTransaction.orderedDate = format(new Date(), 'dd-MM-yyyy, HH:mm:ss');
    newTransaction.orderedTimestamp = Timestamp.fromDate(new Date()).toMillis();

    await transactionDocRef.set(newTransaction);

    return h
      .response({
        error: false,
        message: 'success',
        data: newTransaction,
      })
      .code(201);
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

export default addTransactions;
