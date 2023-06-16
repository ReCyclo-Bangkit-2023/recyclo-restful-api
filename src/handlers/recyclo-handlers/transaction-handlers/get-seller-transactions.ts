import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import type { TransactionSellerDocProps } from '../../../types/types.js';

const firestoreDB = new Firestore();

const getSellerTransactions = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  const { userId } = request.auth.credentials as {
    userId: string;
  };

  const sellerTransactionsRef = firestoreDB.collection(
    config.CLOUD_FIRESTORE_TRANSACTION_SELLERS_COLLECTION
  );

  const sellerTransactionSnapshot = await sellerTransactionsRef.get();

  const sellerTransactionDocsData: TransactionSellerDocProps[] = [];

  sellerTransactionSnapshot.forEach((sellerTransactionDoc) => {
    const sellerTransactionDocData =
      sellerTransactionDoc.data() as TransactionSellerDocProps;
    sellerTransactionDocsData.push(sellerTransactionDocData);
  });

  const sellerTransactions: (TransactionSellerDocProps & {
    key: number;
  })[] = [];

  sellerTransactionDocsData
    .filter(
      (sellerTransactionDocData) =>
        sellerTransactionDocData.sellerDetails.userId === userId
    )
    .forEach((sellerTransactionDoc, idx) => {
      sellerTransactions.push({
        key: idx + 1,
        ...sellerTransactionDoc,
      });
    });

  return h.response({
    error: false,
    message: 'success',
    data: sellerTransactions,
  });
};

export default getSellerTransactions;
