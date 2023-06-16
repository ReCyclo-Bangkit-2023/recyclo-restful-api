import { Firestore, Timestamp } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import { format } from 'date-fns';
import config from '../../../config/config.js';
import NotFoundError from '../../../exception/not-found-error.js';
import type {
  ItemCartDocProps,
  RecycledItem,
  TransactionClientDocProps,
  TransactionSellerDocProps,
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

    const transactionClientsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_TRANSACTION_CLIENTS_COLLECTION
    );

    const transactionClientDocRef = transactionClientsRef.doc();
    const transactionClientId = transactionClientDocRef.id;

    const usersRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_USERS_COLLECTION
    );

    const clientDocRef = usersRef.doc(userId);

    const { password: _, ...clientDocData } = (
      await clientDocRef.get()
    ).data() as UserDataDocProps;

    const newTransactionClient: TransactionClientDocProps = {
      id: transactionClientId,
      userDetails: clientDocData,
      transactionItemsDetails: [],
      orderedDate: '',
      orderedTimestamp: 0,
    };

    const newTransactionSellers: TransactionSellerDocProps[] = [];

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

        // Get seller user detail
        const { password: _, ...sellerDocData } = (
          await usersRef.doc(recycledItemData.userId).get()
        ).data() as UserDataDocProps;

        const sameSellerIdx =
          newTransactionClient.transactionItemsDetails.findIndex(
            (transactionItemDetails) =>
              transactionItemDetails.sellerDetails.userId ===
              recycledItemData.userId
          );

        const sameSellerTxIdx = newTransactionSellers.findIndex(
          (newTransactionSeller) =>
            newTransactionSeller.sellerDetails.userId ===
            recycledItemData.userId
        );

        if (sameSellerIdx && transactionAmountExceeded) {
          newTransactionClient.transactionItemsDetails[
            sameSellerIdx
          ].transactionItemDetails.push({
            recycledItem: recycledItemData,
            itemCartAmount: itemCartDocData.amount,
            statusItemTransaction: 'rejected',
            message: `stok tidak mencukupi. stok terkini ${recycledItemData.amount}`,
          });
        } else if (sameSellerIdx) {
          newTransactionClient.transactionItemsDetails[
            sameSellerIdx
          ].transactionItemDetails.push({
            recycledItem: {
              ...recycledItemData,
              amount: recycledItemData.amount - itemCartDocData.amount,
            },
            itemCartAmount: itemCartDocData.amount,
            statusItemTransaction: 'accepted',
            message: 'Stok tersedia',
          });

          newTransactionClient.transactionItemsDetails[
            sameSellerIdx
          ].transactionPrice +=
            recycledItemData.price * itemCartDocData.amount + 1000;

          newTransactionClient.transactionItemsDetails[
            sameSellerIdx
          ].transactionTotalAmount += itemCartDocData.amount;

          tx.update(recycledItemDocRef, {
            amount: recycledItemData.amount - itemCartDocData.amount,
          });
        } else if (transactionAmountExceeded) {
          newTransactionClient.transactionItemsDetails.push({
            transactionId: '',
            sellerDetails: sellerDocData,
            transactionItemDetails: [
              {
                recycledItem: recycledItemData,
                itemCartAmount: itemCartDocData.amount,
                statusItemTransaction: 'rejected',
                message: `stok tidak mencukupi. stok terkini ${recycledItemData.amount}`,
              },
            ],
            statusTransaction: 'waiting',
            transactionPrice: 0,
            transactionTotalAmount: 0,
          });
        } else {
          newTransactionClient.transactionItemsDetails.push({
            transactionId: '',
            sellerDetails: sellerDocData,
            transactionItemDetails: [
              {
                recycledItem: {
                  ...recycledItemData,
                  amount: recycledItemData.amount - itemCartDocData.amount,
                },
                itemCartAmount: itemCartDocData.amount,
                statusItemTransaction: 'accepted',
                message: `stok tersedia`,
              },
            ],
            statusTransaction: 'waiting',
            transactionPrice: 0,
            transactionTotalAmount: 0,
          });
        }

        if (sameSellerTxIdx) {
          newTransactionSellers[sameSellerTxIdx].transactionItemDetails.push({
            recycledItem: {
              ...recycledItemData,
              amount: recycledItemData.amount - itemCartDocData.amount,
            },
            itemCartAmount: itemCartDocData.amount,
          });

          newTransactionSellers[sameSellerTxIdx].transactionPrice +=
            recycledItemData.amount * itemCartDocData.amount + 1000;

          newTransactionSellers[sameSellerTxIdx].transactionTotalAmount +=
            itemCartDocData.amount;
        } else {
          newTransactionSellers.push({
            id: '',
            userDetails: clientDocData,
            sellerDetails: sellerDocData,
            transactionItemDetails: [
              {
                recycledItem: {
                  ...recycledItemData,
                  amount: recycledItemData.amount - itemCartDocData.amount,
                },
                itemCartAmount: itemCartDocData.amount,
              },
            ],
            statusTransaction: 'waiting',
            transactionPrice: 0,
            transactionTotalAmount: 0,
            orderedDate: '',
            orderedTimestamp: 0,
          });
        }
      });
    }

    for (const itemCartId of itemCartIds) {
      await itemCartsRef.doc(itemCartId).delete();
    }

    const transactionSellersRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_TRANSACTION_SELLERS_COLLECTION
    );

    const orderedDate = format(new Date(), 'dd-MM-yyyy, HH:mm:ss');
    const orderedTimestamp = Timestamp.fromDate(new Date()).toMillis();

    for (const newTransactionSeller of newTransactionSellers) {
      const transactionSellerDocRef = transactionSellersRef.doc();
      const transactionSellerDocId = transactionSellerDocRef.id;
      newTransactionSeller.id = transactionSellerDocId;
      newTransactionSeller.orderedDate = orderedDate;
      newTransactionSeller.orderedTimestamp = orderedTimestamp;
      await transactionSellerDocRef.set(newTransactionSeller);

      newTransactionClient.transactionItemsDetails.map(
        (transactionItemDetails) => {
          const sellerId = transactionItemDetails.sellerDetails.userId;
          const newTransactionSellerId =
            newTransactionSeller.sellerDetails.userId;

          if (sellerId === newTransactionSellerId) {
            transactionItemDetails.transactionId = transactionSellerDocId;
          }
        }
      );
    }

    const transactionsCanceled =
      newTransactionClient.transactionItemsDetails.every(
        (transactionItemDetails) =>
          transactionItemDetails.transactionItemDetails.every(
            (transactionItemDetails) =>
              transactionItemDetails.statusItemTransaction === 'rejected'
          )
      );

    if (transactionsCanceled) {
      return h
        .response({
          error: false,
          message: 'semua stok barang atau sampah daur ulang tidak mencukupi',
          data: {},
        })
        .code(200);
    }

    newTransactionClient.orderedDate = orderedDate;
    newTransactionClient.orderedTimestamp = orderedTimestamp;

    await transactionClientDocRef.set(newTransactionClient);

    return h
      .response({
        error: false,
        message: 'success',
        data: newTransactionClient,
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
